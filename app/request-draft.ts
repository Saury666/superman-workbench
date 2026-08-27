export type ToolId = 'team' | 'billing';
export type DraftFields = {
  workspaceId: string; coupon: string; country: string; currency: string;
  startDate: string; endDate: string; credential: string;
};

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  enabled: process.env.NEXT_PUBLIC_ENABLE_API === 'true',
};

export function buildDraft(tool: ToolId, fields: DraftFields) {
  const payloads = {
    team: { workspaceId: fields.workspaceId || 'ws_...', coupon: fields.coupon || null, country: fields.country, currency: fields.currency },
    billing: { workspaceId: fields.workspaceId || 'ws_...', startDate: fields.startDate || 'YYYY-MM-DD', endDate: fields.endDate || 'YYYY-MM-DD' },
  };
  return `// 本地生成的配置草稿；此文件不会包含 Token / Session\nconst config = ${JSON.stringify({ tool, payload: payloads[tool] }, null, 2)};\n\n// 接口默认关闭。仅在获得第三方正式授权后配置：\nconst apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;\nconst apiEnabled = process.env.NEXT_PUBLIC_ENABLE_API === "true";\n\nif (!apiEnabled || !apiBaseUrl) {\n  console.info("当前为本地草稿模式，未发送任何请求。", config);\n}\n\nexport default config;`;
}
