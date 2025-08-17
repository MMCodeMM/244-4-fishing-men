import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaFish, FaMapMarkerAlt, FaCalendar, FaEdit, FaSave, FaTimes, FaCamera, FaTrophy, FaChartLine } from 'react-icons/fa';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 40px;
  font-size: 2.5rem;
`;

const ProfileSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const AvatarInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
`;

const ProfileEmail = styled.p`
  color: #666;
  margin-bottom: 15px;
  font-size: 1.1rem;
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const EditButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
  }
`;

const ProfileForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  grid-column: 1 / -1;
`;

const SaveButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #218838;
    transform: translateY(-2px);
  }
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #5a6268;
    transform: translateY(-2px);
  }
`;

const RecordsSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RecordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const RecordCard = styled.div`
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    border-color: #667eea;
  }
`;

const RecordImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const RecordContent = styled.div`
  padding: 20px;
`;

const RecordTitle = styled.h4`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RecordDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
`;

const RecordDescription = styled.p`
  color: #555;
  line-height: 1.5;
  font-size: 14px;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NoRecords = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const NoRecordsIcon = styled.div`
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
`;

const AchievementsSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const AchievementCard = styled.div`
  text-align: center;
  padding: 20px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  transition: all 0.3s ease;

  &.unlocked {
    border-color: #28a745;
    background: #f8fff9;
  }

  &.locked {
    border-color: #ddd;
    background: #f8f9fa;
    opacity: 0.6;
  }
`;

const AchievementIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: ${props => props.unlocked ? '#28a745' : '#ccc'};
`;

const AchievementTitle = styled.h4`
  color: #333;
  margin-bottom: 8px;
  font-size: 1.1rem;
`;

const AchievementDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`;

function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  // 模擬用戶的魚類記錄
  const [userRecords, setUserRecords] = useState([
    {
      id: 1,
      species: '石斑魚',
      scientificName: 'Epinephelus sp.',
      image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=石斑魚',
      location: '南丫島海灘',
      date: '2024-01-15',
      confidence: 85,
      notes: '在淺水區發現，體長約40厘米'
    },
    {
      id: 2,
      species: '鯛魚',
      scientificName: 'Sparus aurata',
      image: 'https://via.placeholder.com/300x200/28a745/ffffff?text=鯛魚',
      location: '中環碼頭',
      date: '2024-01-10',
      confidence: 92,
      notes: '在碼頭附近發現，體長約25厘米'
    }
  ]);

  // 模擬成就系統
  const [achievements] = useState([
    {
      id: 1,
      title: '首次發現',
      description: '完成第一次魚類識別',
      icon: '🎯',
      unlocked: true
    },
    {
      id: 2,
      title: '探索者',
      description: '識別10種不同的魚類',
      icon: '🔍',
      unlocked: true
    },
    {
      id: 3,
      title: '海洋專家',
      description: '識別50種不同的魚類',
      icon: '🏆',
      unlocked: false
    },
    {
      id: 4,
      title: '位置記錄者',
      description: '記錄10個不同的發現位置',
      icon: '📍',
      unlocked: false
    },
    {
      id: 5,
      title: '高精度識別',
      description: '完成10次信心度90%以上的識別',
      icon: '⭐',
      unlocked: false
    },
    {
      id: 6,
      title: '連續記錄',
      description: '連續7天記錄魚類發現',
      icon: '📅',
      unlocked: false
    }
  ]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  const handleSave = async () => {
    try {
      // 這裡應該連接到後端API更新用戶信息
      console.log('更新用戶信息:', editForm);
      alert('用戶信息更新成功！');
      setIsEditing(false);
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新失敗，請稍後再試');
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <Container>
      <Title>個人資料</Title>

      <ProfileSection>
        <ProfileHeader>
          <ProfileAvatar>
            <FaUser />
            <AvatarInput type="file" accept="image/*" />
          </ProfileAvatar>
          
          <ProfileInfo>
            <ProfileName>{user?.name}</ProfileName>
            <ProfileEmail>{user?.email}</ProfileEmail>
            
            <ProfileStats>
              <StatItem>
                <StatNumber>{userRecords.length}</StatNumber>
                <StatLabel>魚類記錄</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{unlockedAchievements}</StatNumber>
                <StatLabel>已解鎖成就</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>
                  {userRecords.length > 0 
                    ? Math.round(userRecords.reduce((sum, r) => sum + r.confidence, 0) / userRecords.length)
                    : 0
                  }%
                </StatNumber>
                <StatLabel>平均信心度</StatLabel>
              </StatItem>
            </ProfileStats>
          </ProfileInfo>

          {!isEditing && (
            <EditButton onClick={handleEdit}>
              <FaEdit />
              編輯資料
            </EditButton>
          )}
        </ProfileHeader>

        {isEditing && (
          <>
            <ProfileForm>
              <FormGroup>
                <Label>姓名</Label>
                <Input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  placeholder="請輸入您的姓名"
                />
              </FormGroup>

              <FormGroup>
                <Label>電子郵件</Label>
                <Input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  placeholder="請輸入您的電子郵件"
                />
              </FormGroup>
            </ProfileForm>

            <FormActions>
              <SaveButton onClick={handleSave}>
                <FaSave />
                保存
              </SaveButton>
              <CancelButton onClick={handleCancel}>
                <FaTimes />
                取消
              </CancelButton>
            </FormActions>
          </>
        )}
      </ProfileSection>

      <RecordsSection>
        <SectionTitle>
          <FaFish />
          我的魚類記錄 ({userRecords.length})
        </SectionTitle>

        {userRecords.length === 0 ? (
          <NoRecords>
            <NoRecordsIcon>🐟</NoRecordsIcon>
            <h3>還沒有魚類記錄</h3>
            <p>開始識別魚類來創建您的第一條記錄吧！</p>
          </NoRecords>
        ) : (
          <RecordsGrid>
            {userRecords.map(record => (
              <RecordCard key={record.id}>
                <RecordImage src={record.image} alt={record.species} />
                <RecordContent>
                  <RecordTitle>
                    <FaFish />
                    {record.species}
                  </RecordTitle>
                  
                  <RecordDetails>
                    <DetailItem>
                      <FaMapMarkerAlt />
                      {record.location}
                    </DetailItem>
                    <DetailItem>
                      <FaCalendar />
                      {record.date}
                    </DetailItem>
                    <DetailItem>
                      <FaChartLine />
                      {record.confidence}%
                    </DetailItem>
                  </RecordDetails>

                  <RecordDescription>{record.notes}</RecordDescription>
                </RecordContent>
              </RecordCard>
            ))}
          </RecordsGrid>
        )}
      </RecordsSection>

      <AchievementsSection>
        <SectionTitle>
          <FaTrophy />
          成就系統 ({unlockedAchievements}/{totalAchievements})
        </SectionTitle>
        
        <AchievementsGrid>
          {achievements.map(achievement => (
            <AchievementCard key={achievement.id} className={achievement.unlocked ? 'unlocked' : 'locked'}>
              <AchievementIcon unlocked={achievement.unlocked}>
                {achievement.icon}
              </AchievementIcon>
              <AchievementTitle>{achievement.title}</AchievementTitle>
              <AchievementDescription>{achievement.description}</AchievementDescription>
            </AchievementCard>
          ))}
        </AchievementsGrid>
      </AchievementsSection>
    </Container>
  );
}

export default Profile;
