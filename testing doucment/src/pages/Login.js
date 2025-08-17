import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaFish, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
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

const LoginButton = styled.button`
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

const RegisterLink = styled(Link)`
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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('請填寫所有欄位');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        setSuccess('登入成功！正在跳轉...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error || '登入失敗，請檢查您的憑證');
      }
    } catch (err) {
      setError('登入時發生錯誤，請稍後再試');
    }

    setLoading(false);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <FaFish />
        </Logo>
        <Title>歡迎回來</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">
              <FaEnvelope style={{ marginRight: '8px' }} />
              電子郵件
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入您的密碼"
              required
            />
          </FormGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? '登入中...' : (
              <>
                <FaSignInAlt style={{ marginRight: '8px' }} />
                登入
              </>
            )}
          </LoginButton>
        </Form>

        <Divider>
          <span>還沒有帳戶？</span>
        </Divider>

        <RegisterLink to="/register">
          立即註冊新帳戶
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
}

export default Login;
