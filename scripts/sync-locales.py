"""Render both language routes from the translation data in the main HTML files.

Run from the repository root with Python and lxml after editing translations.
Case heading and lede translations also supply the homepage cards and metadata.
"""
import json
import re
from html import escape
from pathlib import Path
from urllib.parse import urljoin, urlsplit

from lxml import etree, html

ORIGIN = "https://simonovsky.com"
PAGES = [Path("index.html"), Path("cases/studypaths/index.html"), Path("cases/dreamerz/index.html")]
ROUTES = {"/" + (str(page.parent) + "/" if page.parent != Path(".") else "") for page in PAGES}


def case_headings(document, data):
    keys = [document.get_element_by_id(name).get("data-i18n") for name in ("b-title", "b-lede")]
    return {
        language: tuple(
            html.fragment_fromstring(data["text"][key][language], create_parent=True).text_content()
            for key in keys
        )
        for language in ("ru", "en")
    }


def sync_headings(page, document, data):
    if page == Path("index.html"):
        for card in document.xpath('//a[@data-case-id]'):
            case = html.document_fromstring((Path("cases") / card.get("data-case-id") / "index.html").read_text())
            case_data = json.loads(case.get_element_by_id("translations").text)
            title = card.xpath('.//*[@class="case-title"]')[0]
            subtitle = card.xpath('.//*[@class="case-desc"]')[0]
            arrow = etree.tostring(title.find("span"), encoding="unicode", method="html", with_tail=False)
            for language, (heading, lede) in case_headings(case, case_data).items():
                data["text"][title.get("data-i18n")][language] = escape(heading, quote=False) + " " + arrow
                data["text"][subtitle.get("data-i18n")][language] = escape(lede, quote=False)
        return

    for language, (heading, lede) in case_headings(document, data).items():
        data["title"][language] = heading
        for item in data["meta"]:
            if item["selector"].endswith('title"]'):
                item[language] = heading
            elif item["selector"].endswith('description"]'):
                item[language] = lede


def set_content(element, markup):
    for child in list(element):
        element.remove(child)
    element.text = None
    for part in html.fragments_fromstring(markup):
        if isinstance(part, str):
            element.text = part
        else:
            element.append(part)


def render(page, language, root=False):
    document = html.document_fromstring(page.read_text())
    data = json.loads(document.get_element_by_id("translations").text)
    sync_headings(page, document, data)
    route = "/" + (str(page.parent) + "/" if page.parent != Path(".") else "")
    data["markdown"] = "/portfolio.md" if route == "/" else route + page.parent.name + ".md"
    prefix = "/" + language
    document.set("lang", language)
    document.find("head/title").text = data["title"][language]
    for variants in data["text"].values():
        for locale, markup in variants.items():
            variants[locale] = re.sub(r'((?:src|href)=")(?!#)([^"]+)"',
                                      lambda match: match[1] + urljoin(route, match[2]) + '"', markup)
    document.get_element_by_id("translations").text = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    for element in document.xpath("//*[@data-i18n]"):
        markup = data["text"][element.get("data-i18n")][language]
        set_content(element, markup)
    for item in data["attrs"]:
        for element in document.xpath('//*[@data-i18n-attr=$key]', key=item["key"]):
            element.set(item["attr"], item[language])
    for item in data["meta"]:
        selector = item["selector"].replace("[", "[@", 1)
        document.xpath("//" + selector)[0].set("content", item[language])
    for element in document.xpath("//*[@href or @src or @data-src or @srcset or @data-image]"):
        for attr in ("href", "src", "data-src", "data-image"):
            value = element.get(attr)
            if value and not value.startswith("#") and not urlsplit(value).scheme:
                element.set(attr, urljoin(route, value))
        if element.get("srcset"):
            element.set("srcset", ", ".join(
                " ".join([urljoin(route, parts[0]), *parts[1:]])
                for source in element.get("srcset").split(",")
                if (parts := source.split())
            ))
        if element.tag == "a":
            destination = element.get("data-language-route") or element.get("href")
            if destination in ROUTES:
                element.set("data-language-route", destination)
                element.set("href", prefix + destination)
    head = document.find("head")
    for element in head.xpath('link[@rel="alternate"][@type="text/markdown"]'):
        head.remove(element)
    if language == "ru":
        etree.SubElement(head, "link", rel="alternate", type="text/markdown", href=data["markdown"])
    if not root:
        for element in document.xpath('//*[@data-root-only]'):
            element.getparent().remove(element)
    for element in head.xpath('link[@hreflang]'):
        head.remove(element)
    head.xpath('link[@rel="canonical"]')[0].set("href", ORIGIN + prefix + route)
    for locale, base in (("en", "/en"), ("ru", "/ru"), ("x-default", "/en")):
        etree.SubElement(head, "link", rel="alternate", hreflang=locale, href=ORIGIN + base + route)
    for element in head.xpath('meta[@property="og:url"]'):
        element.set("content", ORIGIN + prefix + route)
    toggle = document.get_element_by_id("language-toggle")
    target = "en" if language == "ru" else "ru"
    toggle.text = target.upper()
    toggle.set("href", "/" + target + route)
    toggle.set("lang", target)
    toggle.set("hreflang", target)
    toggle.set("aria-label", "Switch to English" if language == "ru" else "Переключить на русский")
    return "<!DOCTYPE html>\n" + etree.tostring(document, encoding="unicode", method="html") + "\n"


for page in PAGES:
    russian = render(page, "ru")
    english = render(page, "en")
    localized = Path("ru") / page
    localized.parent.mkdir(parents=True, exist_ok=True)
    localized.write_text(russian)
    english_page = Path("en") / page
    english_page.parent.mkdir(parents=True, exist_ok=True)
    english_page.write_text(english)
    page.write_text(render(page, "en", root=True) if page == Path("index.html") else english)
