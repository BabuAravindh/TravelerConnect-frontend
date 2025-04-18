"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Modal, Button, Form, Input, Upload, message, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const RefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Fetch all refunds
  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/refund`);
      setRefunds(response.data);
    } catch (error) {
      message.error('Failed to fetch refunds');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  // Handle refund update
  const handleUpdateRefund = async (values) => {
    try {
      const formData = new FormData();
      formData.append('adminComment', values.adminComment);
      
      // Ensure we have a file to upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('proof', fileList[0].originFileObj);
      } else if (selectedRefund?.status === 'pending') {
        message.error('Proof image is required for pending refunds');
        return;
      }
  
      const response = await axios.patch(
        `${API_URL}/refunds/proof/${selectedRefund._id}`,
        formData,
        {
          headers: {
            // Let the browser set the Content-Type with boundary
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      message.success(response.data.message);
      fetchRefunds();
      setIsModalVisible(false);
      setFileList([]);
    } catch (error) {
      console.error('Full error:', error);
      if (error.response) {
        // Server responded with error status
        message.error(error.response.data.error || 'Failed to update refund');
      } else if (error.request) {
        // Request was made but no response received
        message.error('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request
        message.error('Error setting up request: ' + error.message);
      }
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Booking ID',
      dataIndex: ['bookingId', '_id'],
      key: 'bookingId',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{
          color: status === 'refunded' ? 'green' : 'orange',
          fontWeight: 'bold',
          textTransform: 'capitalize'
        }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedRefund(record);
            form.setFieldsValue({
              adminComment: record.adminComment || '',
            });
            setIsModalVisible(true);
          }}
        >
          {record.status === 'refunded' ? 'View Details' : 'Process Refund'}
        </Button>
      ),
    },
  ];

  // Upload props
  const uploadProps = {
    onRemove: (file) => {
      setFileList(fileList.filter(item => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    accept: 'image/*',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Refund Management</h1>
      
      <Table
        columns={columns}
        dataSource={refunds}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`Refund Details - ${selectedRefund?._id}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setFileList([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateRefund}
          initialValues={{
            adminComment: selectedRefund?.adminComment || '',
          }}
        >
          <Form.Item label="Booking ID">
            <Input value={selectedRefund?.bookingId?._id || 'N/A'} disabled />
          </Form.Item>

          <Form.Item label="Amount">
            <Input 
              value={`$${selectedRefund?.amount?.toFixed(2) || '0.00'}`} 
              disabled 
            />
          </Form.Item>

          <Form.Item label="Current Status">
            <Input 
              value={selectedRefund?.status?.toUpperCase() || ''} 
              disabled 
            />
          </Form.Item>

          {selectedRefund?.proof && (
            <Form.Item label="Refund Proof">
              <Image
                width={200}
                src={selectedRefund.proof}
                alt="Refund proof"
              />
            </Form.Item>
          )}

          <Form.Item
            label="Admin Comment"
            name="adminComment"
            rules={[{ required: true, message: 'Please enter a comment' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          {selectedRefund?.status !== 'refunded' && (
            <Form.Item label="Upload Refund Proof">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
              <p style={{ color: 'gray', marginTop: '8px' }}>
                Upload proof of refund (image format)
              </p>
            </Form.Item>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              disabled={selectedRefund?.status === 'refunded'}
            >
              {selectedRefund?.status === 'refunded' ? 'Already Processed' : 'Submit Refund'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RefundManagement;