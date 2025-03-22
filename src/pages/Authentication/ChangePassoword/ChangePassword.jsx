import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { auth } from '../../config/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handlePasswordChange = async (values) => {
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const user = auth.currentUser;
      
      // First, re-authenticate the user
      const credential = EmailAuthProvider.credential(
        user.email,
        values.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Then change the password
      await updatePassword(user, values.newPassword);

      setMessage({
        type: 'success',
        content: '✅ Password successfully updated!'
      });
      form.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({
        type: 'error',
        content: error.code === 'auth/wrong-password' 
          ? '❌ Current password is incorrect!'
          : '❌ Failed to change password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Change Password</h2>
      
      {message.content && (
        <Alert
          message={message.content}
          type={message.type}
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handlePasswordChange}
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: 'Please input your current password!' }
          ]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please input your new password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: '40px',
              fontSize: '16px'
            }}
          >
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePassword;