import { Metadata } from 'next';
import Hero from '@/components/hero-home';
import Features from '@/components/features';
import Workflows from '@/components/workflows';
import PastServices from '@/components/past-services';
import Announcements from '@/components/announcements';

export const metadata: Metadata = {
  title: '반낭코 - 문화생활을 혁신하다',
  description: '반낭코는 인류의 문화생활을 혁신하겠다는 목표를 가진, Computer Science 중심 IT 회사입니다.',
  metadataBase: new URL('https://bannangco.com'),
  openGraph: {
    title: '반낭코 - 문화생활을 혁신하다',
    description: '반낭코는 인류의 문화생활을 혁신하겠다는 목표를 가진, Computer Science 중심 IT 회사입니다.',
    type: 'website',
    url: 'https://bannangco.com',
    images: [
      {
        url: '/images/ogimage.png',
        width: 1200,
        height: 630,
        alt: '반낭코 - 문화생활을 혁신하다'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '반낭코 - 문화생활을 혁신하다',
    description: '반낭코는 인류의 문화생활을 혁신하겠다는 목표를 가진, Computer Science 중심 IT 회사입니다.',
    images: ['/images/ogimage.png']
  },
  other: {
    'naver-site-verification': 'a75309cf6a38af2e26f52da0166fdf92baf2e951'
  }
};

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Announcements />
      <Workflows />
      <PastServices />
    </>
  );
}
