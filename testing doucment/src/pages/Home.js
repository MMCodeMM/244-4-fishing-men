import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaCamera, FaMapMarkedAlt, FaSearch, FaFish, FaWater, FaGlobeAsia } from 'react-icons/fa';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: white;
  color: #667eea;
  padding: 15px 30px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0,0,0,0.15);
  }
`;

const FeaturesSection = styled.section`
  padding: 80px 0;
  background: white;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: #333;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 40px 20px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const StatsSection = styled.section`
  padding: 80px 0;
  background: #f8f9fa;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
`;

const StatItem = styled.div`
  padding: 20px;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 1.1rem;
`;

const AboutSection = styled.section`
  padding: 80px 0;
  background: white;
`;

const AboutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const AboutText = styled.div`
  h3 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #333;
  }

  p {
    color: #666;
    line-height: 1.8;
    margin-bottom: 20px;
  }
`;

const AboutImage = styled.div`
  text-align: center;
  font-size: 8rem;
  color: #667eea;
  opacity: 0.8;
`;

function Home() {
  const { user } = useAuth();

  return (
    <>
      <HeroSection>
        <Container>
          <HeroTitle>探索香港海洋生態</HeroTitle>
          <HeroSubtitle>
            使用AI技術識別魚類，記錄您的發現，與其他海洋愛好者分享知識
          </HeroSubtitle>
          {user ? (
            <CTAButton to="/identify">開始識別魚類</CTAButton>
          ) : (
            <CTAButton to="/register">立即開始</CTAButton>
          )}
        </Container>
      </HeroSection>

      <FeaturesSection>
        <Container>
          <SectionTitle>主要功能</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>
                <FaCamera />
              </FeatureIcon>
              <FeatureTitle>AI魚類識別</FeatureTitle>
              <FeatureDescription>
                拍攝或上傳魚類照片，使用先進的AI技術自動識別魚類種類
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <FaMapMarkedAlt />
              </FeatureIcon>
              <FeatureTitle>位置記錄</FeatureTitle>
              <FeatureDescription>
                在地圖上標記魚類發現位置，建立香港海洋生態資料庫
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <FaSearch />
              </FeatureIcon>
              <FeatureTitle>智能搜尋</FeatureTitle>
              <FeatureDescription>
                根據名稱、特徵或位置搜尋魚類資訊，快速找到您需要的資料
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </Container>
      </FeaturesSection>

      <StatsSection>
        <Container>
          <SectionTitle>應用程式統計</SectionTitle>
          <StatsGrid>
            <StatItem>
              <StatNumber>1000+</StatNumber>
              <StatLabel>已識別魚類</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>500+</StatNumber>
              <StatLabel>活躍用戶</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>50+</StatNumber>
              <StatLabel>魚類種類</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>100+</StatNumber>
              <StatLabel>記錄位置</StatLabel>
            </StatItem>
          </StatsGrid>
        </Container>
      </StatsSection>

      <AboutSection>
        <Container>
          <AboutContent>
            <AboutText>
              <h3>關於香港海洋生態</h3>
              <p>
                香港擁有豐富的海洋生態系統，包括超過400種魚類。我們的應用程式致力於幫助用戶認識和保護這些珍貴的海洋生物。
              </p>
              <p>
                通過記錄和分享魚類發現，我們可以更好地了解香港海洋生態的變化，為海洋保護提供寶貴的數據支持。
              </p>
            </AboutText>
            <AboutImage>
              <FaWater />
            </AboutImage>
          </AboutContent>
        </Container>
      </AboutSection>
    </>
  );
}

export default Home;
