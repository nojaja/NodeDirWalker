/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ['src/index.ts'],
  out: 'docs/typedoc-md',
  plugin: ['typedoc-plugin-markdown'],
  readme: 'none',
  excludePrivate: false,
  excludeProtected: false,
  excludeInternal: false,
  includeVersion: true,
  tsconfig: 'tsconfig.json',
  
  // Markdown plugin options
  hidePageTitle: false,
  hideBreadcrumbs: false,
  
  // 日本語ドキュメント用設定
  name: 'dir-walker API ドキュメント',
  
  // 出力制御
  cleanOutputDir: true,
  
  // カテゴリ設定
  categorizeByGroup: true,
  defaultCategory: 'その他',
  
  // リンク設定
  gitRevision: 'main',
  
  // 詳細度
  treatWarningsAsErrors: false,
  validation: {
    notExported: true,
    invalidLink: true,
    notDocumented: false
  }
};
