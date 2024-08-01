const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { Translate } = require("@google-cloud/translate").v2;

const API_KEY = "AIzaSyBWuuXdrv9DAe_xDj7u_oqOSN3f2mKbots"; // 여기에 받은 API 키를 넣으세요.
const translate = new Translate({ key: API_KEY });

async function translateText(text, targetLanguage) {
  // 입력 텍스트가 비어 있는지 확인합니다.
  if (!text || typeof text !== "string" || text.trim() === "") {
    console.error("Error: No valid text provided for translation.");
    console.log(text);
    return ""; // 또는 에러 처리 로직 추가
  }

  try {
    // Google Translate API 호출
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // 번역 실패 시 원문 반환
  }
}

const fetchButtonProps = async () => {
  const response = await fetch("/docs/buttonProps.json");
  if (!response.ok) {
    throw new Error("Failed to fetch button props");
  }
  return response.json();
};

async function scrapeTable() {
  // Puppeteer를 사용하여 브라우저를 엽니다.
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 대상 URL로 이동합니다.
  await page.goto("https://ant.design/components/button");

  // 페이지의 HTML을 가져옵니다.
  const content = await page.content();
  await browser.close();

  // Cheerio를 사용하여 HTML을 로드합니다.
  const $ = cheerio.load(content);

  // 원하는 테이블을 선택합니다.
  const table = $(".component-api-table").first();

  // 테이블의 헤더와 데이터를 추출합니다.
  let headers = [];
  table.find("thead th").each((index, element) => {
    headers.push($(element).text().trim());
  });

  console.log(headers);

  let rows = [];
  for (const rowElement of table.find("tbody tr").toArray()) {
    let row = {};
    $(rowElement)
      .find("td")
      .each((i, el) => {
        row[headers[i]] = $(el).text().trim();
      });

    // 'description' 필드를 한국어로 번역
    if (row.Description) {
      row.description_ko = await translateText(row.Description, "ko");
    }

    rows.push(row);
  }

  const componentName = "Button";

  for (const row of rows) {
    fs.writeFileSync(
      path.join(__dirname, "docs", `${componentName}.json`),
      JSON.stringify(rows, null, 2)
    );

    let docsTable = `
import React, { useEffect, useState } from 'react';

const fetchProps = async () => {
  const response = await fetch('/docs/${componentName}.json');
  if (!response.ok) {
    throw new Error('Failed to fetch ${componentName} props');
  }
  return response.json();
};

const ${componentName}Docs = () => {
  const [props, setProps] = useState([]);

  useEffect(() => {
    fetchProps().then(setProps).catch(console.error);
  }, []);

  return (
    <div>
      <h1>${componentName} Component</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <td>{prop.name}</td>
              <td>{prop.type}</td>
              <td>{prop.description_ko}</td>
              <td>{prop.defaultValue === null ? 'N/A' : prop.defaultValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ${componentName}Docs;
`;
    fs.writeFileSync(
      path.join(__dirname, "docs", `${componentName}Docs.js`),
      docsTable
    );
    let tsContent = `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from 'antd';

const meta = {
  title: 'General/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs:{
        page: CustomDocs,
    }
  },
} satisfies Meta<typeof ${componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    type: 'primary',
    children: '${componentName}',
    style: { position: 'relative' },
  },
};`;

    fs.writeFileSync(
      path.join(__dirname, "docs", `${componentName}.ts`),
      tsContent
    );
  }

  // JSON 형태로 출력합니다.
  //console.log(JSON.stringify(rows, null, 2));
}

scrapeTable().catch(console.error);
