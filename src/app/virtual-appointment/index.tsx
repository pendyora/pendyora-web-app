'use client';

import React, { useEffect, useState } from 'react';

import { Button, Card, DatePicker, Form, Image, Input, Modal, notification, Select, Steps, Typography } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment-timezone';

import { JEWELRY_TYPE } from '@/constants/master.constant';
import { useHoneypot } from '@/hook/useHoneypot';
import { apiAppointment } from '@/services/authService';
import { useAppSelector } from '@/store';
import { isDisposableDomain, isValidEmailFormat } from '@/utils/emailValidation';

const { Step } = Steps;
const { Title, Text } = Typography;

const generateTimeSlots = (date: any, timeZone: any) => {
  const startHour = 9; // 7 AM
  const endHour = 18; // 4 PM

  const slots = [];
  let currentHour = startHour;

  while (currentHour < endHour) {
    // Format the start time
    const h = dayjs().set('hour', currentHour).format();

    const hour = moment(h).tz(timeZone).format().split('T')[1].split(':')[0];
    const CH = Number(hour);
    const startPeriod = CH < 12 ? 'AM' : 'PM';
    const server_startPeriod = currentHour < 12 ? 'AM' : 'PM';
    const startHourFormatted = CH % 12 === 0 ? 12 : CH % 12;
    const server_startHourFormatted = currentHour % 12 === 0 ? 12 : currentHour % 12;
    const startTime = `${startHourFormatted}:00 ${startPeriod}`;
    const server_startTime = `${server_startHourFormatted}:00 ${server_startPeriod}`;

    const endTime = `${startHourFormatted}:50 ${startPeriod}`;
    const server_endTime = `${server_startHourFormatted}:50 ${server_startPeriod}`;

    slots.push({
      label: `${startTime} - ${endTime}`,
      server_time: `${server_startTime} - ${server_endTime}`,
      value: currentHour,
      time: startTime,
    });
    currentHour += 1; // Move to the next hour
  }
  return slots;
};

export default function VirtualAppointment() {
  // America/New_York

  const { data } = useAppSelector((state) => state.master);
  const { user } = useAppSelector((state) => state.auth.auth);
  const [timeSlots, setTimeSlots] = useState<any>([]);
  const dateFormat = 'DD/MM/YYYY';
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [AppointmentData, setAppointmentData] = useState<any>({
    locations: 'Virtual Appointment',
    date: moment().tz(timeZone).format('DD/MM/YYYY'),
    time: '',
    service: '',
    name: '',
    email: '',
    phone_numbers: '',
    message: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setAppointmentData((prev: any) => ({
        ...prev,
        name: `${user.first_name} ${user.last_name}` || prev.name,
        email: user.email || prev.email,
        phone_numbers: user.phone || prev.phone_numbers,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (moment().tz('America/New_York').format('HH') >= '17') {
      setAppointmentData((prev: any) => {
        return {
          ...prev,
          date: moment().tz('America/New_York').add(1, 'day').format('DD/MM/YYYY'),
        };
      });
    }
    // setAppointmentData((prev: any) => {
    //   return { ...prev, date: dayjs().format("DD/MM/YYYY") };
    // });
  }, []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [emailError, setEmailError] = useState('');
  const { HoneypotField, isHoneypotClean } = useHoneypot('appointment_website_confirm');

  const showModal = () => {
    setCurrentStep(0);
    setIsModalVisible(true);
    setTimeZone('America/New_York');
  };

  useEffect(() => {
    setTimeSlots(generateTimeSlots(AppointmentData.date, timeZone));
  }, [AppointmentData.date, timeZone]);
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentStep(0);
    setAppointmentData({
      locations: 'Virtual Appointment',
      date: dayjs().format('DD/MM/YYYY'),
      time: '',
      service: '',
      name: '',
      email: '',
      phone_numbers: '',
      message: '',
      password: '',
    });
    setTimeZone('America/New_York');
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const onChange = (key: any, value: any) => {
    setAppointmentData((prev: any) => {
      return { ...prev, [key]: value };
    });
  };

  const onSubmit = async () => {
    if (!isHoneypotClean()) {
      return;
    }
    const emailValue = (AppointmentData?.email || '').trim();
    if (!emailValue || !isValidEmailFormat(emailValue)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (isDisposableDomain(emailValue)) {
      setEmailError('Please enter a valid permanent email address');
      return;
    }
    setEmailError('');
    try {
      const selectedSlot = timeSlots.find((item: any) => item.value === AppointmentData.time);
      if (!selectedSlot?.server_time) {
        notification.error({ message: 'Please select a valid time slot.' });
        return;
      }
      const res: any = await apiAppointment({
        ...AppointmentData,
        jewelry_type: AppointmentData.service,
        date: dayjs(AppointmentData.date, dateFormat).format('YYYY-MM-DD'),
        time: selectedSlot.server_time,
      });

      notification.success({
        message: res?.data?.message,
      });
      handleCancel();
    } catch (error: any) {
      notification.error({
        message: error.response.data.message,
      });
    }
  };
  return (
    <div className="w-full h-full">
      <div className="p-10 bg-[#f9f9f9] flex justify-center sm:p-0 ">
        <div className="p-4 w-[90%] sm:w-full ">
          <div className="flex w-full  gap-10 sm:gap-4 flex-row md:flex-col">
            <div className="w-[45%] md:w-full">
              <Image
                src="/images/virtual-appointment.webp" // Replace with your image path
                alt="Virtual Appointment"
                // width={600}
                preview={false}
                // height={400}
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className="w-[48%] md:w-full">
              <Title level={2} style={{ marginBottom: '20px' }} className="sm:!text-[18px]">
                Virtual Appointment
              </Title>
              <Text style={{ fontSize: '16px', lineHeight: '1.8' }} className="sm:!text-[12px]">
                Book a virtual appointment with one of our jewelry specialists and experience a personalized video consultation where you can explore
                engagement rings, wedding bands, loose gemstones, fine jewelry, and more.
              </Text>
              <div style={{ marginTop: '30px' }} className="sm:!mt-3 ">
                <Text style={{ display: 'block', marginBottom: '10px' }} className="sm:!text-[12px]">
                  From the comfort of your own home
                </Text>
                <Text className="sm:!text-[12px]">Daily: 9:00 am - 6:00 pm </Text>
              </div>
              <Button
                className="!bg-secondary !text-text_w sm:!mt-3 sm:!text-[12px] sm:w-full sm:!h-[35px]"
                size="large"
                onClick={showModal}
                style={{ marginTop: '30px' }}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        title="Virtual Appointment"
        destroyOnClose
        maskClosable={false}
        className=" !w-[55%] 2xl:!w-[65%]  xl:!w-[75%] lg:!w-[79%]  md:!w-[90%] sm:!w-[90%]"
        styles={{
          body: { maxHeight: 'min(90dvh, calc(100vh - 120px))', overflowY: 'auto', overflowX: 'visible' },
        }}
      >
        <div className="w-full p-5 sm:p-0">
          <Steps
            className="force-horizontal-steps"
            current={currentStep}
            direction="horizontal"
            progressDot={true}
            onChange={(step) => setCurrentStep(step)}
            style={{ marginBottom: '10px' }}
          >
            <Step
              title="Service"
              description={AppointmentData.service != '' ? AppointmentData?.service : 'Select a Service'}
              className="sm:!text-[10px]"
            />
            <Step
              title="Date & Time"
              disabled={AppointmentData.service === ''}
              description={
                AppointmentData.date != ''
                  ? AppointmentData.time != ''
                    ? ` ${dayjs(AppointmentData.date, dateFormat).format('MMMM Do YYYY')} - ${
                        timeSlots?.find((item: any) => item.value === AppointmentData.time)?.label
                      }`
                    : dayjs(AppointmentData.date, dateFormat).format('MMMM Do YYYY')
                  : 'Select a Date & Time'
              }
            />
            <Step
              title="Confirm"
              disabled={AppointmentData.date === '' && AppointmentData.time === '' && AppointmentData.service === ''}
              description="Confirm Your Appointment"
            />
          </Steps>
          {currentStep === 0 && (
            <div className="flex flex-col h-full">
              <Title level={4} className="sm:!text-[16px]">
                Select a Service
              </Title>
              <div className="flex gap-3 flex-wrap">
                {JEWELRY_TYPE.map((service: any, index: number) => (
                  <Card
                    hoverable
                    key={index}
                    className={`w-[49%] md:w-full h-fit ${service.title === AppointmentData?.service ? 'border border-primary' : 'border border-[#f0f0f0]'}`}
                    onClick={() => onChange('service', service.title)}
                    style={{
                      border: service.title === AppointmentData?.service ? '1px solid #17381d' : '1px solid #f0f0f0',
                    }}
                  >
                    <div className="flex sm:grid sm:grid-cols-5">
                      <div className="sm:col-span-1 sm:flex sm:items-center ">
                        <Image
                          src={service.image}
                          preview={false}
                          width={'100%'}
                          alt={service.title}
                          className="sm:w-full sm:!aspect-square sm:h-full object-cover"
                        />
                      </div>
                      <div className="flex  flex-col p-5 sm:col-span-4 sm:p-2 sm:pt-0">
                        <Title level={5} className="!m-0 sm:!text-[14px]">
                          {service.title}
                        </Title>
                        {/* <Text>{service.duration}</Text> */}
                        <Text className="leading sm:!text-[12px] sm:!leading-3">{service.description}</Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div style={{ marginTop: '20px', textAlign: 'right' }} className="sm:w-full sm:flex sm:gap-2 sm:justify-between">
                <Button
                  style={{ marginRight: '8px' }}
                  disabled={currentStep == 0}
                  onClick={handlePrevious}
                  className="sm:!h-[35px] sm:!w-1/2 sm:!text-[12px]"
                >
                  Previous
                </Button>
                <Button
                  className="!bg-secondary !text-text_w sm:!w-1/2 sm:!h-[35px] sm:!text-[12px]"
                  disabled={AppointmentData.service == ''}
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <Title level={4} className="sm:!text-[16px]">
                Select a Date & Time (EST)
              </Title>
              <div className="flex gap-4 flex-row lg:flex-col">
                <div className="w-[300px] sm:w-full ">
                  <DatePicker
                    className="w-[300px] sm:w-full"
                    format={dateFormat}
                    size="small"
                    value={AppointmentData.date ? dayjs(AppointmentData.date, dateFormat) : null}
                    getPopupContainer={(trigger) => trigger.closest('.ant-modal-content') || trigger.parentElement || document.body}
                    disabledDate={(current) => {
                      return current && current < dayjs();
                    }}
                    onChange={(date, dateString) => {
                      if (date && date.isValid()) {
                        onChange('date', dateString);
                      } else {
                        console.error('Invalid date selected');
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <Select
                      className="w-[300px] sm:w-full"
                      value={timeZone}
                      size="small"
                      getPopupContainer={(trigger) => trigger.closest('.ant-modal-content') || trigger.parentElement || document.body}
                      popupMatchSelectWidth={false}
                      listHeight={256}
                      onChange={(value) => {
                        setTimeZone(value);
                      }}
                    >
                      <Select.Option value="America/Chicago">Central Time (CT)</Select.Option>
                      <Select.Option value="America/New_York">Eastern Time (ET)</Select.Option>
                      <Select.Option value="America/Denver">Mountain Time (MT)</Select.Option>
                      <Select.Option value="America/Los_Angeles">Pacific Time (PT)</Select.Option>
                      <Select.Option value="UTC">UTC (Coordinated Universal Time)</Select.Option>
                      <Select.Option value="Asia/Kolkata">Indian Standard Time (IST)</Select.Option>
                    </Select>
                  </div>

                  <div className="w-fit flex  gap-2 flex-wrap sm:grid sm:grid-cols-2 sm:w-full">
                    {timeSlots.length > 0 &&
                      timeSlots.map((slot: any, index: number) => {
                        // let hour = moment().tz("Asia/Kolkata").format("hh");
                        const hour = dayjs().format('HH');
                        // .tz("IST")
                        // .format()
                        // .split("T")[1]
                        // .split(":")[0];

                        const today = dayjs().startOf('day');
                        if (dayjs(AppointmentData.date, dateFormat).isSame(today, 'day')) {
                          if ('18' > String(slot.value) && String(slot.value) > '10') {
                            if (hour < String(slot.value)) {
                              return (
                                <div
                                  className={`w-[200px] sm:w-full sm:!h-[30px] sm:flex sm:items-center sm:justify-center px-2 py-4 text-center border border-gray-300 cursor-pointer${
                                    AppointmentData.time === slot.value ? ' bg-secondary text-text_w' : ''
                                  }`}
                                  key={index}
                                  onClick={() => {
                                    onChange('time', slot.value);
                                  }}
                                >
                                  {slot.label}
                                </div>
                              );
                            }
                          }
                        } else if (dayjs(AppointmentData.date, dateFormat).isAfter(today, 'day')) {
                          return (
                            <div
                              className={`w-[200px] sm:!h-[30px] sm:w-full sm:flex sm:items-center sm:justify-center px-2 py-4 text-center border border-gray-300 cursor-pointer${
                                AppointmentData.time === slot.value ? ' bg-secondary text-text_w' : ''
                              }`}
                              key={index}
                              onClick={() => {
                                onChange('time', slot.value);
                              }}
                            >
                              {slot.label}
                            </div>
                          );
                        } else {
                          onChange('date', dayjs().add(1, 'day').format(dateFormat));
                        }
                      })}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px', textAlign: 'right' }} className="sm:w-full sm:flex sm:gap-2 sm:justify-between">
                <Button style={{ marginRight: '8px' }} onClick={handlePrevious} className="sm:!h-[35px] sm:!w-1/2 sm:!text-[12px]">
                  Previous
                </Button>
                <Button
                  className="!bg-secondary !text-text_w sm:!w-1/2 sm:!h-[35px] sm:!text-[12px]"
                  disabled={AppointmentData.time === '' || AppointmentData.date === ''}
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="flex w-full justify-center">
                <Title level={4} className="sm:!text-[16px]">
                  Confirm Details
                </Title>
              </div>
              <div className="flex gap-4 w-full flex-row md:flex-col">
                <Card className="w-[48%] md:w-full">
                  <Form
                    size="small"
                    layout="vertical"
                    autoComplete="off"
                    onFinish={onSubmit}
                    initialValues={{
                      name: AppointmentData.name,
                      email: AppointmentData.email,
                      phone_numbers: AppointmentData.phone_numbers,
                      message: AppointmentData.message,
                    }}
                    onValuesChange={(changedValues, allValues) => {
                      if (Object.prototype.hasOwnProperty.call(changedValues, 'email')) {
                        setEmailError('');
                      }
                      setAppointmentData((prev: any) => ({
                        ...prev,
                        ...allValues,
                      }));
                    }}
                  >
                    <HoneypotField />
                    <div className="flex flex-col sm:mt-4">
                      <Form.Item
                        label="Full Name"
                        name="name"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter your full name',
                          },
                        ]}
                      >
                        <Input placeholder="Full Name" />
                      </Form.Item>
                      <Form.Item
                        label="Email"
                        name="email"
                        validateTrigger="onChange"
                        validateStatus={emailError ? 'error' : undefined}
                        help={emailError || undefined}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter your email address',
                          },
                          {
                            validator: (_, value) => {
                              if (!value) {
                                return Promise.resolve();
                              }
                              if (!isValidEmailFormat(value)) {
                                return Promise.reject(new Error('Please enter a valid email address'));
                              }
                              if (isDisposableDomain(value)) {
                                return Promise.reject(new Error('Please enter a valid permanent email address'));
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input placeholder="Email Address" />
                      </Form.Item>

                      <Form.Item
                        label="Phone"
                        name="phone_numbers"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter your phone number',
                          },
                          {
                            pattern: /^[0-9]{7,15}$/, // Regex for 10 digits
                            message: 'Please enter a valid phone number',
                          },
                        ]}
                      >
                        <Input placeholder="Phone Number" type="number" />
                      </Form.Item>
                      <Form.Item
                        label="Message"
                        name="message"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter your message',
                          },
                        ]}
                      >
                        <Input.TextArea placeholder="Message" />
                      </Form.Item>
                    </div>
                  </Form>
                </Card>

                <Card className="w-[48%] md:w-full">
                  <div className=" flex flex-col gap-5 sm:gap-2">
                    <div className="">
                      <Title className="!m-0 sm:!text-[14px]" level={5}>
                        LOCATION
                      </Title>
                      <Text className="sm:!text-[12px]">{AppointmentData.locations}</Text>
                    </div>
                    {/* <br /> */}
                    <div>
                      <Title className="!m-0 sm:!text-[14px]" level={5}>
                        SERVICE
                      </Title>
                      <Text>{data.find((item) => item?.name === AppointmentData?.service)?.name}</Text>
                    </div>
                    {/* <br /> */}
                    <div>
                      <Title className="!m-0 sm:!text-[14px]" level={5}>
                        DATE & TIME
                      </Title>
                      <Text className="sm:!text-[12px]">
                        {dayjs(AppointmentData.date, dateFormat).format('MMMM Do YYYY') +
                          ' - ' +
                          (timeSlots.find((item: any) => item.value === AppointmentData.time)?.label ?? '')}
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }} className="sm:w-full sm:flex sm:gap-2 sm:justify-between">
                <Button style={{ marginRight: '8px' }} onClick={handlePrevious} className="sm:!h-[35px] sm:!w-1/2 sm:!text-[12px]">
                  Previous
                </Button>
                <Button
                  className="!bg-secondary !text-text_w sm:!w-1/2 sm:!h-[35px] sm:!text-[12px]"
                  disabled={
                    AppointmentData.first_name === '' ||
                    AppointmentData.last_name === '' ||
                    AppointmentData.email === '' ||
                    AppointmentData.phone_numbers === ''
                  }
                  onClick={onSubmit}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
