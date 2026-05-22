'use client';
import React, { useEffect, useState } from 'react';

import { UploadOutlined } from '@ant-design/icons';
import { Form, Input, Select, Button, Upload, Image, notification } from 'antd';
import _ from 'lodash';
import Link from 'next/link';
import { FaRegUser } from 'react-icons/fa6';
import { GiBigDiamondRing } from 'react-icons/gi';
import { LuUpload } from 'react-icons/lu';

import { useHoneypot } from '@/hook/useHoneypot';
import { apiRequestCustomJewelry } from '@/services/orderService';
import { useAppSelector } from '@/store';
import { isDisposableDomain, isValidEmailFormat } from '@/utils/emailValidation';
import { encrypt } from '@/utils/enc-decy';

const CustomJewelryDesign = () => {
  const masterData = useAppSelector((state) => state.master.data);
  const [form] = Form.useForm();
  const [masterOptions, setMasterOptions] = useState<
    { label: any; title: string; options: { label: any; labelText: string; value: string; name: string; code: string; image: string }[] }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { HoneypotField, isHoneypotClean } = useHoneypot('custom_jewelry_website_confirm');

  useEffect(() => {
    if (masterData.length > 0) {
      const DiamondColorNG = _.filter(masterData, (item: any) => item.parent_code === 'NG');
      const DiamondColorLG = _.filter(masterData, (item: any) => item.parent_code === 'LG');

      const uniqueCategories = [
        {
          label: 'Natural Diamonds',
          title: 'natural_diamonds',
          options: [..._.uniqBy(DiamondColorNG, 'code')]?.map((item: any) => ({
            label: (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex justify-center items-center">
                  <Image
                    className="!w-full !h-full object-cover"
                    src={item?.image[0] ? item?.image[0] : '/images/no_images.jpg'}
                    alt="Diamond Master"
                    preview={false}
                    fallback="/images/no_images.jpg"
                  />
                </div>
                {`${item?.name}`}
              </div>
            ),
            labelText: `${item?.name}`,
            value: item?.id,
            name: item?.name,
            code: item?.code,
            image: item?.image[0] ? item?.image[0] : '/images/no_images.jpg',
          })),
        },
        {
          label: 'Lab Grawn Diamonds',
          title: 'lab_grown_diamonds',
          options: [..._.uniqBy(DiamondColorLG, 'code')]?.map((item: any) => ({
            label: (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex justify-center items-center">
                  <Image
                    className="!w-full !h-full object-cover"
                    src={item?.image[0] ? item?.image[0] : '/images/no_images.jpg'}
                    alt="Diamond Master"
                    preview={false}
                    fallback="/images/no_images.jpg"
                  />
                </div>
                {`${item?.name}`}
              </div>
            ),
            labelText: `${item?.name}`,
            value: item?.id,
            name: item?.name,
            code: item?.code,
            image: item?.image[0] ? item?.image[0] : '/images/no_images.jpg',
          })),
        },
      ];
      if (uniqueCategories?.length > 0) {
        setMasterOptions(uniqueCategories);
      }
    }
  }, [masterData]);

  const onFinish = async (values: any) => {
    if (!isHoneypotClean()) {
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequestCustomJewelry(values);
      if (res?.status === 200) {
        form.resetFields();
        setLoading(false);
        // Optionally, you can show a success message or redirect the user
        notification.success({
          message: 'Request Submitted',
          description: 'Your custom jewelry request was submitted successfully!',
          placement: 'top',
        });
      } else {
        setLoading(false);
        alert('Failed to submit custom jewelry request. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      console.error('❌ Error submitting form:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <header className="bg-white py-12 md:py-5 px-10 md:px-0 text-center">
        <div className="max-w-4xl mx-auto px-14 md:px-4 mt-14 md:mt-6">
          <h1 className="text-[48px] md:text-[30px] font-castoro mb-8">CUSTOM JEWELRY DESIGN</h1>
          <p className="font-thin text-[18px] mb-8">
            If you are looking for an engagement ring or matching band or anything that is not listed on our website, we can custom make it to your
            exact specifications. This allows you to get the designer look for a fraction of the price.
          </p>
          <div className="grid grid-cols-3 sm:flex justify-center flex-wrap gap-10 mb-8 w-full mt-16">
            <div className="sm:w-[44%] relative bg-white p-4 shadow-md flex flex-col justify-center items-center  text-center border-2 border-primary">
              <div className="w-[50px] font-bold text-primary mb-2 border-2 border-primary bg-white -top-7 rounded-full aspect-square absolute flex items-center justify-center">
                1
              </div>
              <p className="font-medium pt-8 md:pt-5">Submit Drawings, Sketches Or Pictures</p>
              <Image src="/images/custom-design/customstep1.png" preview={false} alt="Step 1" className="w-[174px] mx-auto mt-2 md:hidden" />
            </div>
            <div className="sm:w-[44%] relative bg-white p-4 shadow-md flex flex-col justify-center items-center  text-center border-2 border-primary">
              <div className="w-[50px] font-bold text-primary mb-2 border-2 border-primary bg-white -top-7 rounded-full aspect-square absolute flex items-center justify-center">
                2
              </div>
              <p className="font-medium pt-8 md:pt-5">Receive Our Rendering for Approval</p>
              <Image src="/images/custom-design/customstep2.webp" preview={false} alt="Step 2" className="w-[174px] mx-auto mt-2 md:hidden" />
            </div>
            <div className="sm:w-[44%] relative bg-white p-4 shadow-md flex flex-col justify-center items-center  text-center border-2 border-primary">
              <div className="w-[50px] font-bold text-primary mb-2 border-2 border-primary bg-white -top-7 rounded-full aspect-square absolute flex items-center justify-center">
                3
              </div>
              <p className="font-medium pt-8 md:pt-5">Jewelry is Cast, Polished and Completed</p>
              <Image src="/images/custom-design/customstep3.webp" preview={false} alt="Step 3" className="w-[174px] mx-auto mt-2 md:hidden" />
            </div>
          </div>
          {/* <a href="#custom-jewelry-form"> */}
          <Button
            type="default"
            onClick={() => {
              const el = document.getElementById('custom-jewelry-form');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            size="large"
            className="!bg-secondary min-w-[250px] !h-[45px] !text-white px-6 py-2 rounded"
          >
            START NOW
          </Button>
          {/* </a> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 mx-auto mt-12 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </header>

      {/* Form Section */}
      <div className="bg-stone-100">
        <section className="container-xs py-12 px-[300px] lg:px-[30px] md:px-5 sm:px-3" id="custom-jewelry-form">
          <div className="mx-auto">
            <p className="text-center text-gray-600 mt-8 mb-20 md:mt-0 md:mb-14 px-[250px] lg:px-[230px] sm:px-10">
              To get started on your custom engagement ring, please submit this form and a representative will contact you within 1-2 business days.
            </p>
            <Form form={form} onFinish={onFinish} layout="vertical" className="space-y-6 sm:px-5">
              <HoneypotField />
              <div className="grid grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6 w-full md:gap-y-16">
                {/* Contact Information */}
                <div className="border-2 border-primary relative w-full min-w-0">
                  <div className="relative p-5 w-full flex flex-col items-center justify-center gap-1 mb-4 bg-secondary text-white ">
                    <div className="absolute flex justify-center items-center w-[70px] h-[70px] aspect-square -top-10 border-2 border-primary bg-white text-primary rounded-full p-4">
                      <FaRegUser className="w-full h-full" />
                    </div>
                    <h3 className="text-[20px] font-castoro pt-4 now">Contact Information</h3>
                    <span className="text-sm font-thin">STEP 1</span>
                  </div>
                  <div className="space-y-4 px-5 pb-5 h-[290px] flex flex-col justify-between">
                    <Form.Item
                      style={{ marginBottom: '0px' }}
                      label="Name"
                      name="name"
                      rules={[{ required: true, message: 'Please enter your name!' }]}
                    >
                      <Input placeholder="Enter Your Name" className="w-full" />
                    </Form.Item>
                    <Form.Item
                      label="Email"
                      name="email"
                      style={{ marginBottom: '0px' }}
                      validateTrigger="onChange"
                      rules={[
                        { required: true, message: 'Please enter your email!' },
                        {
                          validator: (_, value) => {
                            if (!value) {
                              return Promise.resolve();
                            }
                            if (!isValidEmailFormat(value)) {
                              return Promise.reject(new Error('Please enter a valid email!'));
                            }
                            if (isDisposableDomain(value)) {
                              return Promise.reject(new Error('Please enter a valid permanent email address'));
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input placeholder="Enter Your Email" className="w-full" />
                    </Form.Item>
                    <Form.Item
                      style={{ marginBottom: '10px' }}
                      label="Phone"
                      name="phone"
                      rules={[{ required: true, message: 'Please enter your phone number!' }]}
                    >
                      <Input placeholder="Enter Your Phone Number" className="w-full" />
                    </Form.Item>
                  </div>
                </div>

                {/* Ring Information */}
                <div className="border-2 border-primary relative w-full min-w-0">
                  <div className="relative p-5 w-full flex flex-col items-center justify-center gap-1 mb-4 bg-secondary text-white">
                    <div className="absolute flex justify-center items-center w-[70px] h-[70px] aspect-square -top-10 border-2 border-primary bg-white text-primary rounded-full p-4">
                      <GiBigDiamondRing className="w-full h-full" />
                    </div>
                    <h3 className="text-[20px] font-castoro pt-4">Ring Information</h3>
                    <span className="text-sm font-thin">STEP 2</span>
                  </div>
                  <div className="space-y-4 px-5 pb-5 h-[290px] flex flex-col justify-between">
                    <Form.Item
                      style={{ marginBottom: '0px' }}
                      label="Preferred Metal"
                      name="preferred_metal"
                      rules={[{ required: true, message: 'Please select a metal!' }]}
                    >
                      <Select placeholder="Select Metal" className="w-full" popupMatchSelectWidth={false}>
                        <Select.Option value="10k Rose Gold">10k Rose Gold</Select.Option>
                        <Select.Option value="10k White Gold">10k White Gold</Select.Option>
                        <Select.Option value="10k Yellow Gold">10k Yellow Gold</Select.Option>
                        <Select.Option value="14k Rose Gold">14k Rose Gold</Select.Option>
                        <Select.Option value="14k White Gold">14k White Gold</Select.Option>
                        <Select.Option value="14k Yellow Gold">14k Yellow Gold</Select.Option>
                        <Select.Option value="18k Rose Gold">18k Rose Gold</Select.Option>
                        <Select.Option value="18k White Gold">18k White Gold</Select.Option>
                        <Select.Option value="18k Yellow Gold">18k Yellow Gold</Select.Option>
                        <Select.Option value="Black Plated 10k Gold">Black Plated 10k Gold</Select.Option>
                        <Select.Option value="Black Plated 14k Gold">Black Plated 14k Gold</Select.Option>
                        <Select.Option value="Black Plated 18k Gold">Black Plated 18k Gold</Select.Option>
                        <Select.Option value="Platinum">Platinum</Select.Option>
                        <Select.Option value="Sterling Silver">Sterling Silver</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      style={{ marginBottom: '0px' }}
                      label="Price Range"
                      name="price_range"
                      rules={[{ required: true, message: 'Please select a price range!' }]}
                    >
                      <Select placeholder="Select Price Range" className="w-full">
                        <Select.Option value="under $100">Under $100</Select.Option>
                        <Select.Option value="$100-$200">$100-$200</Select.Option>
                        <Select.Option value="$200-$500">$200-$500</Select.Option>
                        <Select.Option value="$500-$1000">$500-$1000</Select.Option>
                        <Select.Option value="$1000-$2500">$1000-$2500</Select.Option>
                        <Select.Option value="More Than 2500">More Than $2500</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      style={{ marginBottom: '10px' }}
                      label="Center Stone"
                      name="center_stone"
                      rules={[{ required: true, message: 'Please select a center stone!' }]}
                    >
                      <Select
                        placeholder="Select Gems"
                        className="w-full"
                        options={masterOptions.map((group) => ({
                          ...group,
                          options: group?.options?.map((option) => ({
                            ...option,
                            label: (
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 flex justify-center items-center`}>
                                  <Image
                                    className="!w-full !h-full object-cover"
                                    src={option.image ? option.image : '/images/no_images.jpg'}
                                    alt="Diamond Master"
                                    preview={false}
                                    fallback="/images/no_images.jpg"
                                  />
                                </div>
                                {`${option?.name}`}
                              </div>
                            ),
                            // disabled: getDisabledOptions(record).includes(option.value),
                          })),
                        }))}
                        showSearch
                        optionFilterProp="option?.labelText"
                        // status={getValidationStatus(record.key, 'master_id')}
                        filterOption={(input, option) => {
                          const opt = option as unknown as { labelText?: string };
                          return (opt.labelText ?? '').toLowerCase().includes(input.toLowerCase());
                        }}
                        // onBlur={() => validateField(text, 'master_id', record.key)}
                      ></Select>
                    </Form.Item>
                  </div>
                </div>

                {/* Upload Images */}
                <div className="border-2 border-primary relative w-full min-w-0">
                  <div className="relative p-5 w-full flex flex-col items-center justify-center gap-1 mb-4 bg-secondary text-white">
                    <div className="absolute flex justify-center items-center w-[70px] h-[70px] aspect-square -top-10 border-2 border-primary bg-white text-primary rounded-full p-4">
                      <LuUpload className="w-full h-full" />
                    </div>
                    <h3 className="text-[20px] font-castoro pt-4">Upload Images</h3>
                    <span className="text-sm font-thin">STEP 3</span>
                  </div>
                  <div className="space-y-4 px-5 pb-5 h-[290px] flex flex-col justify-between">
                    {/* Image 1 */}
                    <Form.Item
                      label="Image 1"
                      name="image_1"
                      style={{ marginBottom: '0px' }}
                      valuePropName="fileList"
                      getValueFromEvent={(e) => (Array.isArray(e?.fileList) ? e.fileList.slice(-1) : [])}
                    >
                      <Upload
                        accept="image/*"
                        listType="text"
                        beforeUpload={() => false}
                        // style={{ border: '1px solid black', background: 'none', width: '200px' }}
                        fileList={Form.useWatch('image_1', form) || []}
                        className="w-full"
                        style={{ width: '100%' }}
                      >
                        {(Form.useWatch('image_1', form) || []).length >= 1 ? null : (
                          <Button
                            icon={<UploadOutlined />}
                            className="!bg-transparent !w-full !flex !items-center !justify-center"
                            style={{ width: '100%' }}
                          >
                            Choose File
                          </Button>
                        )}
                      </Upload>
                    </Form.Item>

                    {/* Image 2 */}
                    <Form.Item
                      label="Image 2"
                      name="image_2"
                      valuePropName="fileList"
                      style={{ marginBottom: '0px' }}
                      getValueFromEvent={(e) => (Array.isArray(e?.fileList) ? e.fileList.slice(-1) : [])}
                    >
                      <Upload
                        accept="image/*"
                        listType="text"
                        beforeUpload={() => false}
                        fileList={Form.useWatch('image_2', form) || []}
                        className="w-full"
                        style={{ width: '100%' }}
                      >
                        {(Form.useWatch('image_2', form) || []).length >= 1 ? null : (
                          <Button
                            icon={<UploadOutlined />}
                            className="!bg-transparent !w-full !flex !items-center !justify-center"
                            style={{ width: '100%' }}
                          >
                            Choose File
                          </Button>
                        )}
                      </Upload>
                    </Form.Item>

                    {/* Image 3 */}
                    <Form.Item
                      label="Image 3"
                      name="image_3"
                      valuePropName="fileList"
                      style={{ marginBottom: '10px' }}
                      getValueFromEvent={(e) => (Array.isArray(e?.fileList) ? e.fileList.slice(-1) : [])}
                    >
                      <Upload
                        accept="image/*"
                        listType="text"
                        beforeUpload={() => false}
                        fileList={Form.useWatch('image_3', form) || []}
                        className="w-full"
                        style={{ width: '100%' }}
                      >
                        {(Form.useWatch('image_3', form) || []).length >= 1 ? null : (
                          <Button
                            icon={<UploadOutlined />}
                            className="!bg-transparent !w-full !flex !items-center !justify-center"
                            style={{ width: '100%' }}
                          >
                            Choose File
                          </Button>
                        )}
                      </Upload>
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <Form.Item
                label="Special Notes"
                name="special_notes"
                className="!font-castoro"
                rules={[{ required: true, message: 'Please provide special notes!' }]}
              >
                <Input.TextArea rows={4} placeholder="Enter your special notes here" className="w-full" />
              </Form.Item>

              {/* Submit Button */}
              <div className="flex justify-center w-full">
                <Button
                  type="default"
                  loading={loading}
                  htmlType="submit"
                  size="large"
                  className="!bg-secondary min-w-[250px] !text-white px-6 py-2 !h-[45px]"
                >
                  Submit
                </Button>
              </div>
            </Form>
          </div>
        </section>
      </div>

      {/* Additional Information Section */}
      <div className="bg-stone-100">
        <section className="container-xs py-12 px-[300px] lg:px-[120px] md:px-5 sm:px-3">
          <div className="mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-castoro mb-4">DESIGN YOUR OWN JEWELRY IN 3 SIMPLE STEPS</h2>
              <p className="text-gray-600 tracking-[0.5px]">
                Buying the right type of jewelry for a special occasion is a daunting task but at Ashclair, we now have a convenient solution. It is
                now possible to design your own jewelry by collaborating with our highly talented team of designers and craftsmen. Whether you are
                looking for the ideal{' '}
                <Link href="/engagement-rings" className="text-primary capitalize italic hover:underline cursor-pointer">
                  engagement ring
                </Link>{' '}
                ,{' '}
                <Link href="/wedding-bands" className="text-primary capitalize italic hover:underline cursor-pointer">
                  wedding bands
                </Link>{' '}
                , or any other kind of ring, we got you covered.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-castoro mb-4">WHY CUSTOM JEWELRY DESIGN</h2>
              <p className="text-gray-600 tracking-[0.5px]">
                Our team at Ashclair is committed to bringing your ring design idea to life at the most affordable price. Through our long experience
                in the industry and our commitment to quality jewelry, we have consistently exceeded the expectations of clients. We invite you to
                design your jewelry with us to save time and money.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-castoro mb-4">LARGE COLLECTION OF RINGS</h2>
              <p className="text-gray-600 tracking-[0.5px]">
                No more hopping from one jewel store to the other; we have everything you need in one place. Whether you need a 10k, 14k, 18k gold
                wedding band or a sterling silver engagement ring, we have these and many more. Our team is highly experienced working with the most
                popular metals such as gold, diamond, sterling silver, platinum, brass, cobalt, tungsten, stainless steel among others. We also have
                in our collection high quality gemstones to accentuate your ring including black, green, red and blue diamond, blue sapphire, ruby,
                Tanzanite, Amethyst, blue topaz, quartz among others. With this wide range of rings and center stones in our store, there is no reason
                for you to buy stock jewelry.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-castoro mb-4">PERSONALIZED JEWELRY MADE EASIER</h2>
              <p className="text-gray-600 tracking-[0.5px]">
                This versatile collection makes jewelry customization easier and more affordable. You can now make your dream ring a reality through
                these easy steps:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-600 tracking-[0.5px]">
                <li>Contact us: We require a few details including name, email and phone number for ease of communication.</li>
                <li>
                  Submit ring design/sketch: Provide our designers with the ring you have in mind. This also includes the preferred metal, center
                  stone and price range. You can upload images of the ring design if you have any.
                </li>
                <li>
                  Presentation of rendering: Our team provides a rendering of the ring based on your requirements. At this stage, you can give a
                  go-ahead or request some modification.
                </li>
              </ol>
              <p className="text-gray-600 mt-4 tracking-[0.5px]">
                Once you have given us the approval, our team goes to work to handcraft the best piece for you. We promise 100% satisfaction and we do
                this by delivering high quality craftsmanship. You will have another chance to look at the finished piece before delivery. When you
                design your own jewelry with us, it saves you time and money and you enjoy peace of mind knowing the customized piece reflects your
                needs.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomJewelryDesign;
