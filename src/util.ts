export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const base64StringToUTF8 = (base64Str: string) => {
  const base64buf = Buffer.from(base64Str, "base64"); // parse base64 string to buffer
  const text = base64buf.toString("utf8"); // base64 buffer to utf-8 string
  return text;
};

export const base64BufToUTF8 = (buf: Buffer): string => {
  const base64Text = buf.toString();
  return base64StringToUTF8(base64Text);
};