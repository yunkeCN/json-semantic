import * as jsondiffpatch from "jsondiffpatch";

const DefaultHtmlFormatter = (jsondiffpatch.formatters.html as any).default;

function htmlEscape(text: string): string {
  let html = text;
  let replacements = [
    [/&/g, '&amp;'],
    [/</g, '&lt;'],
    [/>/g, '&gt;'],
    [/'/g, '&apos;'],
    [/"/g, '&quot;'],
  ];
  for (let i = 0; i < replacements.length; i++) {
    html = html.replace(replacements[i][0], replacements[i][1] as string);
  }
  return html;
}

class HtmlFormatter extends DefaultHtmlFormatter {
  formatValue(context: any, value: any) {
    const text = JSON.stringify(value, (key: string, value: any) => {
      if (value instanceof RegExp) {
        return `/${value.source}/${value.flags}`;
      }
      return value;
    }, 2);
    context.out(`<pre>${text ? htmlEscape(text) : text}</pre>`);
  }
}

export default HtmlFormatter;