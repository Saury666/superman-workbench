'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildDraft, type DraftFields, type ToolId } from './request-draft';

const tools = [
  { id: 'team' as const, index: '01', label: 'Team 48个月转长链（免 IP）', note: '本地生成长链草稿' },
  { id: 'billing' as const, index: '02', label: 'Team 账单时间', note: '检测单席费用与续费时间' },
];

const initialFields: DraftFields = {
  workspaceId: '', coupon: '', country: 'CN', currency: 'USD',
  startDate: '', endDate: '', credential: '',
};

export default function Home() {
  const [active, setActive] = useState<ToolId>('team');
  const [fields, setFields] = useState<DraftFields>(initialFields);
  const [rememberSecret, setRememberSecret] = useState(false);
  const [notice, setNotice] = useState('等待生成');
  const [billingScript, setBillingScript] = useState('正在载入账单检测脚本…');
  const selected = tools.find((tool) => tool.id === active)!;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('moss-workbench-preferences');
      if (saved) setFields((current) => ({ ...current, ...JSON.parse(saved), credential: '' }));
      const sessionSecret = sessionStorage.getItem('moss-workbench-secret');
      if (sessionSecret) setFields((current) => ({ ...current, credential: sessionSecret }));
    } catch { /* Storage may be disabled; the tool still works in memory. */ }
  }, []);

  useEffect(() => {
    const { credential: _credential, ...safePreferences } = fields;
    try { localStorage.setItem('moss-workbench-preferences', JSON.stringify(safePreferences)); } catch { /* no-op */ }
  }, [fields]);

  useEffect(() => {
    try {
      if (rememberSecret && fields.credential) sessionStorage.setItem('moss-workbench-secret', fields.credential);
      else sessionStorage.removeItem('moss-workbench-secret');
    } catch { /* no-op */ }
  }, [fields.credential, rememberSecret]);

  useEffect(() => {
    fetch('/team-billing-checker.js').then((response) => response.text()).then(setBillingScript).catch(() => setBillingScript('// 脚本载入失败，请刷新页面重试。'));
  }, []);

  const preview = useMemo(() => active === 'billing' ? billingScript : buildDraft(active, fields), [active, fields, billingScript]);
  const update = (name: keyof DraftFields, value: string) => setFields((current) => ({ ...current, [name]: value }));
  const copyDraft = async () => {
    await navigator.clipboard?.writeText(preview);
    setNotice('已复制到剪贴板');
  };
  const downloadDraft = () => {
    const blob = new Blob([preview], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = active === 'billing' ? 'team-billing-checker.js' : `${active}-request-draft.js`; anchor.click();
    URL.revokeObjectURL(url); setNotice('草稿已下载');
  };
  const clearLocal = () => {
    localStorage.removeItem('moss-workbench-preferences'); sessionStorage.removeItem('moss-workbench-secret');
    setFields(initialFields); setRememberSecret(false); setNotice('本地数据已清除');
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="superman 工作台首页"><img className="brand-avatar" src="/minato-avatar.png" alt="水门头像" /><span>superman 工作台</span></a>
        <div className="header-note"><span /> 数据留在你的设备</div>
        <a className="help-link" href="#privacy">安全说明 <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-kicker"><span>LOCAL FIRST</span><i /> <span>本地优先工具箱</span></div>
        <h1>把复杂配置，<br /><em>留在浏览器里。</em></h1>
        <p>一个为团队订阅与用量管理设计的轻量工作台。先在本地准备参数，再由你决定是否连接已获授权的服务。</p>
        <div className="hero-stamp" aria-hidden="true"><span>PRIVATE</span><b>∞</b><span>BY DEFAULT</span></div>
      </section>

      <section className="workspace" aria-label="配置工作台">
        <nav className="tool-rail" aria-label="选择工具">
          <p className="rail-title">选择工作流</p>
          {tools.map((tool) => <button key={tool.id} className={active === tool.id ? 'tool-item active' : 'tool-item'} onClick={() => { setActive(tool.id); setNotice('等待生成'); }} aria-pressed={active === tool.id}><span className="tool-index">{tool.index}</span><span><strong>{tool.label}</strong><small>{tool.note}</small></span><span className="tool-arrow">→</span></button>)}
          <div className="privacy-card" id="privacy"><span className="privacy-icon">⌁</span><strong>默认不联网</strong><p>Token 与 Session 只在当前浏览器内处理，不写入本站服务器，也不会出现在下载的草稿中。</p><button type="button" onClick={clearLocal}>清除本地数据</button></div>
        </nav>

        <div className="tool-surface">
          <div className="surface-heading"><div><span>STEP {selected.index}</span><h2>{selected.label}</h2></div><span className="status-pill"><i /> 本地模式</span></div>
          <div className="split-grid">
            <form className="form-panel" onSubmit={(event) => event.preventDefault()}>
              <p className="panel-label">配置参数</p>
              {active === 'team' && <>
                <Field label="Workspace ID" value={fields.workspaceId} placeholder="ws_..." onChange={(value) => update('workspaceId', value)} />
                <Field label="优惠码" optional value={fields.coupon} placeholder="例如 WELCOME" onChange={(value) => update('coupon', value)} />
                <div className="field-row"><SelectField label="国家/地区" value={fields.country} options={[['CN','中国大陆'],['SG','新加坡'],['US','美国']]} onChange={(value) => update('country', value)} /><SelectField label="货币" value={fields.currency} options={[['USD','USD'],['CNY','CNY'],['SGD','SGD']]} onChange={(value) => update('currency', value)} /></div>
              </>}
              {active === 'billing' && <div className="billing-guide">
                <p className="guide-badge">只读检测</p>
                <h3>无需在本站填写 Token</h3>
                <p>脚本只读取订阅预览，用来显示新增 1 个席位的费用、北京时间账单时间、席位变化和 Workspace。</p>
                <ol><li>登录 chatgpt.com 的 Workspace 所有者账号</li><li>打开浏览器开发者工具的 Console</li><li>复制右侧完整代码，粘贴并运行</li></ol>
                <div className="safety-line"><i /> 不提交席位变更，不在本站读取你的会话</div>
              </div>}
              {active !== 'billing' && <>
                <Field label="Token / Session" optional secret value={fields.credential} placeholder="仅在浏览器内使用" onChange={(value) => update('credential', value)} />
                <label className="check-row"><input type="checkbox" checked={rememberSecret} onChange={(event) => setRememberSecret(event.target.checked)} /><span><strong>在本次浏览器会话中保留凭据</strong><small>默认关闭；关闭标签页后自动清除</small></span></label>
              </>}
              <button className="primary-button" type="button" onClick={() => setNotice(active === 'billing' ? '代码已准备好，请复制后在 chatgpt.com 运行' : '安全草稿已生成')}>{active === 'billing' ? '准备检测代码' : '生成安全草稿'} <span>→</span></button>
            </form>

            <section className="code-panel" aria-label="代码预览">
              <div className="code-toolbar"><span><i /><i /><i /></span><p>{active === 'billing' ? 'team-billing-checker.js' : `${active}-request-draft.js`}</p><div><button type="button" onClick={copyDraft}>复制</button><button type="button" onClick={downloadDraft}>下载</button></div></div>
              <pre><code>{preview}</code></pre>
              <div className="code-foot"><span>{notice} · 未连接第三方接口</span><span>UTF-8</span></div>
            </section>
          </div>
        </div>
      </section>
      <footer><span>superman 工作台 · 原创本地优先界面</span><span>接口按需接入 · 授权由你掌控</span></footer>
    </main>
  );
}

function Field({ label, optional, secret, value, placeholder, type = 'text', onChange }: { label: string; optional?: boolean; secret?: boolean; value: string; placeholder?: string; type?: string; onChange: (value: string) => void }) {
  return <label>{label} {optional && <span>可选</span>}<input type={secret ? 'password' : type} value={value} placeholder={placeholder} autoComplete="off" onChange={(event) => onChange(event.target.value)} /></label>;
}
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: [string,string][]; onChange: (value: string) => void }) {
  return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select></label>;
}
