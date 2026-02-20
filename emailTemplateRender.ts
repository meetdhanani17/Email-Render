import { isArray } from "util";

export class EmailTemplateRender {
  template: string;
  data: Record<
    string,
    number | boolean | string | null | Array<Record<string, string>>
  >;
  private static removeBlankRegex =
    /(<\s*\w+\s*>\s*)?{#rmblank}\s*([\s\S]*?)\s*{#endrmblank}(\s*<\/\s*\w+\s*>)?/gm;
  private static createBlocLoopRegex = (key: string) =>
    new RegExp(`{#each${key}}(.*?){#end${key}}`, "gs");

  constructor(props: {
    template: string;
    data: Record<
      string,
      number | boolean | string | null | Array<Record<string, string>>
    >;
  }) {
    this.template = props.template;
    this.data = props.data;
  }

  private replacePlaceHolderBlocks(
    e: string,
    list: Array<Record<string, string>>
  ) {
    const regex = EmailTemplateRender.createBlocLoopRegex(e);
    return this.template.replace(regex, (_, key) => {
      return list
        .map((innerObject) => {
          const replacedString = this.removeBlockIfKeyNotFound({
            data: innerObject,
            template: key,
          });
          return this.replaceStrings(replacedString, innerObject);
        })
        .join("");
    }) as string;
  }

  private removeBlockIfKeyNotFound({
    data,
    template,
  }: {
    data: Record<string, string>;
    template?: string;
  }) {
    return (template ?? this.template).replace(
      EmailTemplateRender.removeBlankRegex,
      (template, _) => {
        console.log(template, "template");

        template = template
          .replace("{#rmblank}", "")
          .replace("{#endrmblank}", "");

        let removeString = false;
        const replacedTemplate = this.replaceStrings(template, data, {
          parseValue: (key) => {
            if (data[key]) {
              return data[key];
            } else {
              removeString = true;
            }
            return "";
          },
        });
        if (removeString) {
          return "";
        }
        return replacedTemplate;
      }
    ) as string;
  }

  replacePlaceholders() {
    Object.keys(this.data).forEach((e) => {
      if (isArray(this.data[e])) {
        this.template = this.replacePlaceHolderBlocks(
          e,
          this.data[e] as Array<Record<string, string>>
        );
      }
    });
    this.template = this.removeBlockIfKeyNotFound({
      data: this.data as Record<string, string>,
    });
    return this.replaceStrings(
      this.template,
      this.data as Record<string, string>
    );
  }

  private replaceStrings(
    template: string,
    data: Record<string, string>,
    options?: {
      parseValue: (key: string) => string;
    }
  ): string {
    return template.replace(/{(\w+)}/g, (_, key) => {
      return options?.parseValue(key) ?? data[key] ?? `{${key}}`;
    });
  }
}
