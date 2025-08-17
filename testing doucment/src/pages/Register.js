import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaFish, FaEnvelope, FaLock, FaUser, FaUserPlus } from 'react-icons/fa';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const RegisterButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  margin: 30px 0;
  text-align: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e1e5e9;
  }

  span {
    background: white;
    padding: 0 20px;
    color: #666;
  }
`;

const LoginLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 14px;
`;

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 驗證
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('請填寫所有欄位');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('密碼確認不匹配');
      return;
    }

    if (formData.password.length < 6) {
      setError('密碼至少需要6個字符');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.email, formData.password, formData.name);
      if (result.success) {
        setSuccess('註冊成功！正在跳轉...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error || '註冊失敗，請稍後再試');
      }
    } catch (err) {
      setError('註冊時發生錯誤，請稍後再試');
    }

    setLoading(false);
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <FaFish />
        </Logo>
        <Title>創建新帳戶</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">
              <FaUser style={{ marginRight: '8px' }} />
              姓名
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="請輸入您的姓名"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">
              <FaEnvelope style={{ marginRight: '8px' }} />
              電子郵件
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="請輸入您的電子郵件"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">
              <FaLock style={{ marginRight: '8px' }} />
              密碼
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="請輸入您的密碼"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">
              <FaLock style={{ marginRight: '8px' }} />
              確認密碼
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="請再次輸入您的密碼"
              required
            />
          </FormGroup>

          <RegisterButton type="submit" disabled={loading}>
            {loading ? '註冊中...' : (
              <>
                <FaUserPlus style={{ marginRight: '8px' }} />
                註冊
              </>
            )}
          </RegisterButton>
        </Form>

        <Divider>
          <span>已經有帳戶？</span>
        </Divider>

        <LoginLink to="/login">
          立即登入
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
}

export default Register;
