"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Modal,
  Button,
  Form,
  Input,
  Upload,
  message,
  Image,
  Tag,
  Card,
  Statistic,
  Divider,
  Space,
  Spin,
  Typography,
  Avatar
} from "antd";
import {
  UploadOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined
} from "@ant-design/icons";
const { Text, Title } = Typography;

const RefundManagement = () => {
  // State management
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    refunded: 0,
    rejected: 0
  });

  // Fetch refunds data
  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/refund`
      );
      const refundData = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setRefunds(refundData);
      
      // Calculate statistics
      setStats({
        total: refundData.length,
        pending: refundData.filter(r => r.status === 'pending').length,
        refunded: refundData.filter(r => r.status === 'refunded').length,
        rejected: refundData.filter(r => r.status === 'rejected').length
      });
    } catch (error) {
      message.error("Failed to fetch refunds");
      console.error("Fetch refunds error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  // Handle refund update submission
  const handleUpdateRefund = async (values) => {
    setUploadLoading(true);
    try {
      if (!selectedRefund?._id) {
        throw new Error("No refund selected");
      }

      const formData = new FormData();
      formData.append("adminComment", values.adminComment || "");

      if (fileList.length > 0) {
        const fileObj = fileList[0];
        if (fileObj.originFileObj instanceof File) {
          formData.append("proof", fileObj.originFileObj);
        } else if (fileObj instanceof File) {
          formData.append("proof", fileObj);
        } else {
          throw new Error("Invalid file object");
        }
      } else if (selectedRefund?.status === "pending") {
        message.error("Proof image is required for pending refunds");
        setUploadLoading(false);
        return;
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/refund/proof/${selectedRefund._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 10000,
        }
      );

      message.success(response.data.message || "Refund processed successfully");
      fetchRefunds();
      setIsModalVisible(false);
      setFileList([]);
      form.resetFields();
    } catch (error) {
      console.error("Update refund error:", error);
      if (error.response) {
        message.error(
          error.response.data.error || "Failed to process refund"
        );
      } else if (error.request) {
        message.error("No response from server. Please try again.");
      } else {
        message.error("Error: " + error.message);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Upload component props
  const uploadProps = {
    onRemove: (file) => {
      setFileList(fileList.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    accept: "image/*",
    maxCount: 1,
  };

  // Table columns
  const columns = [
    {
      title: "Booking ID",
      dataIndex: ["bookingId", "_id"],
      key: "bookingId",
      render: (text) => <Text copyable ellipsis>{text || "N/A"}</Text>,
      width: 180,
    },
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.bookingId?.userId?.name || "N/A"}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.bookingId?.userId?.email || "N/A"}
            </div>
          </div>
        </div>
      ),
      width: 220,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Space>
          <DollarOutlined />
          <Text strong>{amount?.toFixed(2) || "0.00"}</Text>
        </Space>
      ),
      align: 'right',
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          pending: {
            color: "orange",
            icon: <ClockCircleOutlined />,
            text: "Pending"
          },
          refunded: {
            color: "green",
            icon: <CheckCircleOutlined />,
            text: "Refunded"
          },
          rejected: {
            color: "red",
            text: "Rejected"
          }
        };
        const statusConfig = statusMap[status] || { color: "gray", text: status };
        return (
          <Tag 
            color={statusConfig.color} 
            icon={statusConfig.icon}
            style={{ borderRadius: 12, padding: '0 8px' }}
          >
            {statusConfig.text}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: "Request Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: 140,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type={record.status === "pending" ? "primary" : "default"}
          onClick={() => {
            setSelectedRefund(record);
            form.setFieldsValue({
              adminComment: record.adminComment || "",
            });
            setFileList([]);
            setIsModalVisible(true);
          }}
          size="small"
        >
          {record.status === "pending" ? "Process" : "View"}
        </Button>
      ),
      width: 100,
      align: 'center',
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Refund Management</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchRefunds}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: 16, 
        marginBottom: 24 
      }}>
        <Card variant={false} hoverable>
          <Statistic 
            title="Total Refunds" 
            value={stats.total} 
            prefix={<ReloadOutlined />} 
            valueStyle={{ fontSize: 24 }}
          />
        </Card>
        <Card variant={false} hoverable>
          <Statistic 
            title="Pending" 
            value={stats.pending} 
            valueStyle={{ color: "#faad14", fontSize: 24 }} 
          />
        </Card>
        <Card variant={false} hoverable>
          <Statistic 
            title="Refunded" 
            value={stats.refunded} 
            valueStyle={{ color: "#52c41a", fontSize: 24 }} 
          />
        </Card>
        <Card variant={false} hoverable>
          <Statistic 
            title="Rejected" 
            value={stats.rejected} 
            valueStyle={{ color: "#ff4d4f", fontSize: 24 }} 
          />
        </Card>
      </div>

      {/* Refunds Table */}
      <Card
        variant={false}
  
        style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 8 }}
      >
        <Table
          columns={columns}
          dataSource={refunds}
          rowKey="_id"
          loading={loading}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} refunds`
          }}
          scroll={{ x: true }}
          size="middle"
        />
      </Card>

      {/* Refund Details Modal */}
      <Modal
        title={
          <div>
            <span>Refund Details</span>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              #{selectedRefund?._id?.slice(-8) || ''}
            </Text>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setFileList([]);
          form.resetFields();
        }}
        footer={null}
        width={700}
        destroyOnClose
        styles={{
          header: { borderBottom: '1px solid #f0f0f0', paddingBottom: 16 },
          body: { paddingTop: 16 }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateRefund}
          initialValues={{
            adminComment: selectedRefund?.adminComment || "",
          }}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 16,
            marginBottom: 16
          }}>
            <Form.Item label="Booking ID">
              <Input
                value={selectedRefund?.bookingId?._id || "N/A"}
                disabled
              />
            </Form.Item>

            <Form.Item label="Amount">
              <Input
                value={`$${selectedRefund?.amount?.toFixed(2) || "0.00"}`}
                disabled
              />
            </Form.Item>
          </div>

          <Card 
            size="small" 
            style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar size={40} icon={<UserOutlined />} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 16 }}>
                  {selectedRefund?.bookingId?.userId?.name || "N/A"}
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>
                  {selectedRefund?.bookingId?.userId?.email || "N/A"}
                </div>
              </div>
            </div>
          </Card>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 16,
            marginBottom: 16
          }}>
            <Form.Item label="Status">
              <Input
                value={selectedRefund?.status?.toUpperCase() || ""}
                disabled
              />
            </Form.Item>

            <Form.Item label="Request Date">
              <Input
                value={selectedRefund?.createdAt ? new Date(selectedRefund.createdAt).toLocaleString() : "N/A"}
                disabled
              />
            </Form.Item>
          </div>

          {selectedRefund?.proof && (
            <Form.Item label="Refund Proof">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                <Image
                  width={150}
                  src={selectedRefund.proof}
                  alt="Refund proof"
                  style={{ 
                    border: "1px solid #f0f0f0", 
                    borderRadius: 4,
                    objectFit: 'cover'
                  }}
                />
                <Button 
                  type="link" 
                  onClick={() => window.open(selectedRefund.proof, '_blank')}
                >
                  View Full Size
                </Button>
              </div>
            </Form.Item>
          )}

          <Form.Item
            label="Admin Comment"
            name="adminComment"
            rules={[
              { required: true, message: "Please enter a comment" },
              { max: 500, message: "Comment must be less than 500 characters" }
            ]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter processing details..." 
              style={{ resize: 'none' }}
            />
          </Form.Item>

          {selectedRefund?.status === "pending" && (
            <Form.Item label="Upload Refund Proof" required>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
              <div style={{ color: "rgba(0, 0, 0, 0.45)", fontSize: 12, marginTop: 8 }}>
                Only image files (JPG/PNG) under 5MB are allowed
              </div>
            </Form.Item>
          )}

          <Divider style={{ margin: '16px 0' }} />

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={selectedRefund?.status !== "pending" || uploadLoading}
                loading={uploadLoading}
              >
                {selectedRefund?.status === "pending" ? "Process Refund" : "Update Comment"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RefundManagement;