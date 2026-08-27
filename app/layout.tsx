import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Serif_SC } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const editorial = Noto_Serif_SC({ variable: '--font-editorial', subsets: ['latin'], weight: ['400', '600'] });

export const metadata: Metadata = {
  title: 'superman 工作台｜本地优先的团队配置工具',
  description: '在浏览器本地准备 Team 48个月转长链并检查 Team 账单时间。敏感凭据默认不上传。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className={`${geistSans.variable} ${geistMono.variable} ${editorial.variable}`}>{children}</body></html>;
}
