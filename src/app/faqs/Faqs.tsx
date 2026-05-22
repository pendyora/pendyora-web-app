'use client';
import React from 'react';

import { Button, Collapse, Result, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Panel } = Collapse;

const { Title } = Typography;
const Faqs = ({ content }: any) => {
  const route = useRouter();
  return (
    <div className="w-full">
      <Title level={2} className="w-full" style={{ textAlign: 'center' }}>
        Frequently Asked Questions
      </Title>
      <div className=" w-full flex flex-col justify-center items-center gap-20  py-10 sm:py-2 border-solid border-[#3b3b3b] 2xl:gap-16 xl:gap-12 lg:gap-8 md:gap-[60px] sm:gap-5 md:px-10 sm:px-5 lg:px-20 ">
        {content && content.length > 0 ? (
          <>
            <Collapse className="w-full">
              {content.map((ele: any, index: number) => {
                return (
                  <Panel header={ele.question} className="w-full" key={index}>
                    <div className="flex sm:flex-col-reverse items-center m-auto about-us-css-setup">
                      <div className="ql-editor" dangerouslySetInnerHTML={{ __html: ele?.answer }} />
                    </div>
                  </Panel>
                );
              })}
            </Collapse>
          </>
        ) : (
          <>
            {' '}
            <Result
              status="404"
              title="404"
              subTitle="Sorry, the page you visited does not exist."
              extra={
                <Button
                  type="primary"
                  onClick={() => {
                    route.push('/');
                  }}
                >
                  Back Home
                </Button>
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Faqs;
