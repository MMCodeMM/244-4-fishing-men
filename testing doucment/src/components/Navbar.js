import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaFish, FaMapMarkedAlt, FaSearch, FaCamera, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Nav = styled.nav`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  min-width: 200px;
  padding: 10px 0;
  margin-top: 10px;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px 20px;
  color: #dc3545;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;

  &:last-child {
    border-bottom: none;
  }
`;

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">
          <FaFish />
          魚類認識
        </Logo>

        <NavMenu>
          <NavLink to="/identify">
            <FaCamera />
            識別魚類
          </NavLink>
          <NavLink to="/map">
            <FaMapMarkedAlt />
            地圖
          </NavLink>
          <NavLink to="/search">
            <FaSearch />
            搜尋
          </NavLink>
        </NavMenu>

        <UserMenu>
          {user ? (
            <>
              <UserButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <FaUser />
                {user.name}
              </UserButton>
              <DropdownMenu isOpen={isDropdownOpen}>
                <DropdownItem to="/profile">
                  <FaUser />
                  個人資料
                </DropdownItem>
                <LogoutButton onClick={handleLogout}>
                  <FaSignOutAlt />
                  登出
                </LogoutButton>
              </DropdownMenu>
            </>
          ) : (
            <>
              <NavLink to="/login">登入</NavLink>
              <NavLink to="/register">註冊</NavLink>
            </>
          )}
        </UserMenu>

        <MobileMenuButton onClick={toggleMobileMenu}>
          ☰
        </MobileMenuButton>
      </NavContainer>

      <MobileMenu isOpen={isMobileMenuOpen}>
        <MobileNavLink to="/identify" onClick={() => setIsMobileMenuOpen(false)}>
          <FaCamera />
          識別魚類
        </MobileNavLink>
        <MobileNavLink to="/map" onClick={() => setIsMobileMenuOpen(false)}>
          <FaMapMarkedAlt />
          地圖
        </MobileNavLink>
        <MobileNavLink to="/search" onClick={() => setIsMobileMenuOpen(false)}>
          <FaSearch />
          搜尋
        </MobileNavLink>
        {user ? (
          <>
            <MobileNavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <FaUser />
              個人資料
            </MobileNavLink>
            <MobileNavLink as="button" onClick={handleLogout}>
              <FaSignOutAlt />
              登出
            </MobileNavLink>
          </>
        ) : (
          <>
            <MobileNavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              登入
            </MobileNavLink>
            <MobileNavLink to="/register" onClick={() => setIsMobileMenuOpen(false)}>
              註冊
            </MobileNavLink>
          </>
        )}
      </MobileMenu>
    </Nav>
  );
}

export default Navbar;
