import React, { ReactNode } from 'react';
import 'react-quill/dist/quill.snow.css';
import '@/styles/tailwind.css';
import '../styles/index.css';
import '../styles/font.css';
import '../styles/antd.css';

import ScrollArrow from '@/components/ScrollArrow';
import { decrypt } from '@/utils/enc-decy';

import AppProviderData from './AppProvider';

async function getHeaderData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mega-menu`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      next: { revalidate: 10 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: any = await response.json();

    if (data.status === 200) {
      return decrypt(data.data);
    }
    return null;
  } catch (error) {
    console.error('Error fetching banner data:', error);
    return null;
  }
}

async function getPromoData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promotional-strips`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      next: { revalidate: 10 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: any = await response.json();
    if (data.status === 200) {
      const resData = decrypt(data.data);
      return resData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching banner data:', error);
    return null;
  }
}

async function RootLayout({ children }: { children: ReactNode }) {
  const initialHeaderMegaData = await getHeaderData();
  const initialPromoData = await getPromoData();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Castoro&display=swap" rel="stylesheet" />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "qwosyewy41");
              `,
          }}
        ></script>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>

        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17230998076"></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17230998076');`,
          }}
        ></script>

        {/* <!-- Google tag (gtag.js) -->  */}
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '714491101467345');
      fbq('track', 'PageView');
    `,
          }}
        />

        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=714491101467345&ev=PageView&noscript=1" />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>

      <body>
        <AppProviderData initialHeaderMegaData={initialHeaderMegaData} initialPromoData={initialPromoData}>
          {children}
        </AppProviderData>
        <ScrollArrow />

        <div
          dangerouslySetInnerHTML={{
            __html: `
              <amp-analytics type="gtag" data-credentials="include">
                <script type="application/json">
                  {
                    "vars": {
                      "gtag_id": "AW-172306",
                      "config": {
                        "AW-17230998076": {
                          "groups": "default"
                        }
                      }
                    },
                    "triggers": {}
                  }
                </script>
              </amp-analytics>`,
          }}
        />

        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              var onWebChat={ar:[], set: function(a,b){if (typeof onWebChat_==='undefined'){this.ar.
              push([a,b]);}else{onWebChat_.set(a,b);}},get:function(a){return(onWebChat_.get(a));},
              w:(function(){ var ga=document.createElement('script'); ga.type = 'text/javascript';
              ga.async=1;ga.src=('https:'==document.location.protocol?'https:':'http:') + 
              '//www.onwebchat.com/clientchat/f5879e3080f533c29068efd87f699142';var s=
              document.getElementsByTagName('script')[0];s.parentNode.insertBefore(ga,s);})()}
              `,
          }}
        ></script>
      </body>
    </html>
  );
}
export default RootLayout;
