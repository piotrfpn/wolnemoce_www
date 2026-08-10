import assert from "node:assert/strict";
import test from "node:test";

async function loadBlogContent() {
  try {
    return await import("../lib/blogContent.ts");
  } catch {
    return null;
  }
}

test("keeps plain text and multiple paragraphs compatible with legacy content", async () => {
  const api = await loadBlogContent();
  assert.ok(api, "blog content parser should exist");

  assert.deepEqual(api.parseBlogContent("Pierwszy akapit"), [
    { type: "paragraph", text: "Pierwszy akapit" },
  ]);
  assert.deepEqual(api.parseBlogContent("Pierwszy akapit\n\nDrugi akapit"), [
    { type: "paragraph", text: "Pierwszy akapit" },
    { type: "paragraph", text: "Drugi akapit" },
  ]);
});

test("parses content images with an optional allowlisted size", async () => {
  const api = await loadBlogContent();
  assert.ok(api, "blog content parser should exist");

  const path = "content/123e4567-e89b-12d3-a456-426614174000.webp";

  assert.deepEqual(
    api.parseBlogContent(`![Stanowisko CNC](${path})`),
    [
      {
        type: "image",
        alt: "Stanowisko CNC",
        path,
      },
    ]
  );

  for (const size of ["small", "medium", "large", "full"]) {
    assert.deepEqual(api.parseBlogContent(`![Stanowisko CNC](${path}){${size}}`), [
      { type: "image", alt: "Stanowisko CNC", path, size },
    ]);
  }
});

test("treats unsafe or malformed image syntax as ordinary text", async () => {
  const api = await loadBlogContent();
  assert.ok(api, "blog content parser should exist");

  const inputs = [
    "![Zewnętrzne](https://example.com/image.jpg)",
    "![Traversal](content/../secret.jpg)",
    "![Data](data:image/png;base64,abc)",
    "![Niekompletne](content/123e4567-e89b-12d3-a456-426614174000.jpg",
    "![Nieznany rozmiar](content/123e4567-e89b-12d3-a456-426614174000.jpg){120px}",
  ];

  for (const input of inputs) {
    assert.deepEqual(api.parseBlogContent(input), [
      { type: "paragraph", text: input },
    ]);
  }
});

test("converts valid TSV clipboard data to an escaped, bounded GFM table", async () => {
  const api = await loadBlogContent();
  assert.ok(api, "blog content parser should exist");

  assert.equal(
    api.buildGfmTableFromTsv("Proces\tOpis\nCNC\tCięcie | frezowanie\nMontaż\tGotowe"),
    "| Proces | Opis |\n| --- | --- |\n| CNC | Cięcie \\| frezowanie |\n| Montaż | Gotowe |"
  );

  const tooManyColumns = Array.from({ length: 9 }, (_, index) => `Kolumna ${index + 1}`).join("\t");
  assert.equal(api.buildGfmTableFromTsv(`${tooManyColumns}\n${tooManyColumns}`), null);

  const headers = "A\tB";
  const tooManyRows = Array.from({ length: 21 }, (_, index) => `${index}\t${index}`).join("\n");
  assert.equal(api.buildGfmTableFromTsv(`${headers}\n${tooManyRows}`), null);
});

test("parses a complete GFM table and rejects incomplete tables", async () => {
  const api = await loadBlogContent();
  assert.ok(api, "blog content parser should exist");

  assert.deepEqual(
    api.parseBlogContent(
      "| Proces | Czas |\n| --- | --- |\n| CNC | 2 dni |\n| Montaż | 1 dzień |"
    ),
    [
      {
        type: "table",
        headers: ["Proces", "Czas"],
        rows: [
          ["CNC", "2 dni"],
          ["Montaż", "1 dzień"],
        ],
      },
    ]
  );

  const incomplete = "| Proces | Czas |\n| --- | --- |";
  assert.deepEqual(api.parseBlogContent(incomplete), [
    { type: "paragraph", text: incomplete },
  ]);
});

test("parses text, images, and tables in one article and handles empty content", async () => {
  const api = await loadBlogContent();
  assert.ok(api, "blog content parser should exist");

  const content = [
    "Wstęp.",
    "![Hala](content/123e4567-e89b-12d3-a456-426614174000.png)",
    "| Parametr | Wartość |\n| --- | --- |\n| Seria | 100 |",
    "Podsumowanie.",
  ].join("\n\n");

  assert.deepEqual(api.parseBlogContent(content).map((block) => block.type), [
    "paragraph",
    "image",
    "table",
    "paragraph",
  ]);
  assert.deepEqual(api.parseBlogContent(""), []);
  assert.deepEqual(api.parseBlogContent("\n\n  \n"), []);
});
