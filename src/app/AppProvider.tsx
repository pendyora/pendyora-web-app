'use client';
import React, { Suspense, useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { usePathname } from 'next/navigation';
import { LuLoader } from 'react-icons/lu';
import { Provider } from 'react-redux';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { AppProvider } from '@/context/AppContext/AppProvider';
import useYotpo from '@/hook/useYotpo';
import store from '@/store';
import { trackPageView } from '@/utils/metaPixel';

const AppProviderData = ({ children, initialHeaderMegaData, initialPromoData }: any) => {
  const pathname = usePathname();
  const isFirstMount = useRef(true);
  const isHomepage = pathname === '/';

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    trackPageView();
  }, [pathname]);
  const primary_color = '#111111';
  const secondary_color = '#C9AE8A';
  const prev_secondary_color = '#F1E9DE';
  const customTheme = {
    token: {
      colorPrimary: primary_color,
      colorPrimaryBg: '#F8F4EE',
      colorText: '#111111',
      colorBgBase: '#FAF9F6',
      fontFamily: "'Libre Franklin', sans-serif",
      // colorBorder: "#BDBDBD", // Border color for inputs, cards, etc.
      colorSuccess: '#388E3C', // Success message or status color
      colorWarning: '#F57C00', // Warning message or status color
      colorError: '#D32F2F', // Error message or status color
      colorLink: '#1976D2', // Link color
      colorLinkHover: '#1565C0', // Link hover color
      // tableRowHoverBg: "#E0F7FA", // Hover color for table rows
      tableSelectedRowBg: '#A7FFEB', // Background color for selected table rows
      tableRowActiveBg: '#64FFDA', // Background color for active rows
      // colorTextHeading: "#2E7D32", // Heading text color
      colorBgContainer: '#FAF9F6',
      borderRadius: 8, // Default border radius for components
    },
  };

  useYotpo(process.env.NEXT_PUBLIC_YOTPO_APP_KEY as string);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
    <Provider store={store}>
      <AntdRegistry>
        <ConfigProvider
          theme={{
            token: customTheme.token,
            components: {
              Button: {
                controlHeight: 45,
                // colorText: '#ffffff',
                borderRadius: 0,
                colorPrimary: secondary_color,
                algorithm: true, // Enable algorithm
              },
              Input: {
                controlHeight: 38,
                colorPrimary: prev_secondary_color,
                borderRadius: 0,
                algorithm: true, // Enable algorithm
              },
              DatePicker: {
                controlHeight: 38,
                colorPrimary: prev_secondary_color,
                borderRadius: 0,
                algorithm: true, // Enable algorithm
              },
              Radio: {
                controlHeight: 38,
                // colorPrimary: '#818d64',
                colorPrimary: secondary_color,
                borderRadius: 0,
                algorithm: true, // Enable algorithm
              },
              Select: {
                controlHeight: 38,
                colorPrimary: prev_secondary_color,
                borderRadius: 0,
                algorithm: true, // Enable algorithm
              },
              Slider: {
                // controlHeight: 38,
                // colorBgBase: '#818d64',
                // colorBgContainer: '#818d64',
                colorPrimary: secondary_color,
                // colorPrimary: '#17381d',
                borderRadius: 0,
                algorithm: true, // Enable algorithm
              },
              Checkbox: {
                // controlHeight: 38,
                colorPrimary: secondary_color,
                // borderRadius: 0,
                algorithm: true, // Enable algorithm
              },
            },
          }}
        >
          <AppProvider>
            <div className="relative">
              <Header
                className={isHomepage ? 'bg-transparent fixed top-0 left-0 right-0' : 'bg-transparent sticky top-0'}                headerMetaData={initialHeaderMegaData}
                promoStripData={initialPromoData}
              />
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-[80vh] bg-ivory">
                    <div className="w-full flex justify-center items-center">
                      <LuLoader className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  </div>
                }
              >
                {children}
              </Suspense>
              <Footer className="overflow-x-hidden" />
            </div>
          </AppProvider>
        </ConfigProvider>
      </AntdRegistry>
    </Provider>
    </ReactLenis>
  );
};

export default AppProviderData;
