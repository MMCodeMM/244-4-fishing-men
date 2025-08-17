import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaCamera, FaUpload, FaSearch, FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';
import Webcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';

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

const UploadSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const UploadCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
`;

const CardTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const WebcamContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const WebcamComponent = styled(Webcam)`
  width: 100%;
  border-radius: 10px;
  border: 2px solid #e1e5e9;
`;

const CameraControls = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &.primary {
    background: #667eea;
    color: white;
  }

  &.secondary {
    background: #6c757d;
    color: white;
  }

  &.success {
    background: #28a745;
    color: white;
  }

  &.danger {
    background: #dc3545;
    color: white;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Dropzone = styled.div`
  border: 2px dashed #667eea;
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;

  &:hover {
    border-color: #5a6fd8;
    background: #e9ecef;
  }

  &.active {
    border-color: #28a745;
    background: #d4edda;
  }
`;

const DropzoneText = styled.p`
  color: #667eea;
  font-size: 1.1rem;
  margin: 0;
`;

const ImagePreview = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const PreviewImage = styled.img`
  width: 100%;
  border-radius: 10px;
  border: 2px solid #e1e5e9;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #dc3545;
    transform: scale(1.1);
  }
`;

const IdentificationSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 2rem;
  text-align: center;
`;

const ResultCard = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #667eea;
`;

const ResultTitle = styled.h4`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.3rem;
`;

const ResultText = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
`;

const ConfidenceBar = styled.div`
  background: #e9ecef;
  border-radius: 10px;
  height: 20px;
  margin: 10px 0;
  overflow: hidden;
`;

const ConfidenceFill = styled.div`
  background: linear-gradient(90deg, #28a745, #20c997);
  height: 100%;
  width: ${props => props.confidence}%;
  transition: width 0.3s ease;
`;

const LocationForm = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
`;

const FormTitle = styled.h4`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: #667eea;
  font-size: 1.2rem;
`;

function FishIdentification() {
  const { user } = useAuth();
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identificationResult, setIdentificationResult] = useState(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    locationName: '',
    notes: ''
  });

  const webcamRef = useRef(null);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const removeImage = (type) => {
    if (type === 'captured') {
      setCapturedImage(null);
    } else {
      setUploadedImage(null);
    }
    setIdentificationResult(null);
    setShowLocationForm(false);
  };

  const identifyFish = async () => {
    const imageToAnalyze = capturedImage || uploadedImage;
    if (!imageToAnalyze) return;

    setIsIdentifying(true);
    setIdentificationResult(null);

    try {
      // 模擬AI識別過程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 模擬識別結果
      const mockResult = {
        species: '石斑魚 (Epinephelus sp.)',
        confidence: 85,
        description: '石斑魚是香港常見的海洋魚類，屬於鮨科。它們通常棲息在珊瑚礁和岩石區域，是重要的商業魚類。',
        characteristics: [
          '體型較大，通常30-100厘米',
          '身體呈橢圓形，側扁',
          '顏色多變，常見有棕色、綠色等',
          '喜歡棲息在岩石和珊瑚區域'
        ],
        habitat: '香港東部水域、南丫島、長洲等海域',
        conservation: '部分品種受到過度捕撈威脅，建議保護'
      };

      setIdentificationResult(mockResult);
      setShowLocationForm(true);
    } catch (error) {
      console.error('識別失敗:', error);
    } finally {
      setIsIdentifying(false);
    }
  };

  const saveRecord = async () => {
    if (!user) {
      alert('請先登入以保存記錄');
      return;
    }

    try {
      // 這裡應該連接到後端API保存記錄
      const record = {
        userId: user.id,
        image: capturedImage || uploadedImage,
        identification: identificationResult,
        location: locationData,
        timestamp: new Date().toISOString()
      };

      console.log('保存記錄:', record);
      alert('記錄保存成功！');
      
      // 重置表單
      setCapturedImage(null);
      setUploadedImage(null);
      setIdentificationResult(null);
      setShowLocationForm(false);
      setLocationData({
        latitude: '',
        longitude: '',
        locationName: '',
        notes: ''
      });
    } catch (error) {
      console.error('保存失敗:', error);
      alert('保存失敗，請稍後再試');
    }
  };

  const handleLocationChange = (e) => {
    setLocationData({
      ...locationData,
      [e.target.name]: e.target.value
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            ...locationData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
        },
        (error) => {
          console.error('無法獲取位置:', error);
          alert('無法獲取您的位置，請手動輸入');
        }
      );
    } else {
      alert('您的瀏覽器不支持地理定位');
    }
  };

  const hasImage = capturedImage || uploadedImage;

  return (
    <Container>
      <Title>魚類識別</Title>

      <UploadSection>
        <UploadCard>
          <CardTitle>
            <FaCamera />
            拍照識別
          </CardTitle>
          
          {!capturedImage ? (
            <>
              <WebcamContainer>
                <WebcamComponent
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                />
              </WebcamContainer>
              <CameraControls>
                <Button className="primary" onClick={capturePhoto}>
                  <FaCamera />
                  拍照
                </Button>
              </CameraControls>
            </>
          ) : (
            <ImagePreview>
              <PreviewImage src={capturedImage} alt="拍攝的照片" />
              <RemoveButton onClick={() => removeImage('captured')}>
                <FaTimes />
              </RemoveButton>
            </ImagePreview>
          )}
        </UploadCard>

        <UploadCard>
          <CardTitle>
            <FaUpload />
            上傳圖片
          </CardTitle>
          
          {!uploadedImage ? (
            <Dropzone {...getRootProps()} className={isDragActive ? 'active' : ''}>
              <input {...getInputProps()} />
              <DropzoneText>
                {isDragActive
                  ? '放開以上傳圖片'
                  : '拖拽圖片到這裡，或點擊選擇圖片'
                }
              </DropzoneText>
            </Dropzone>
          ) : (
            <ImagePreview>
              <PreviewImage src={uploadedImage} alt="上傳的圖片" />
              <RemoveButton onClick={() => removeImage('uploaded')}>
                <FaTimes />
              </RemoveButton>
            </ImagePreview>
          )}
        </UploadCard>
      </UploadSection>

      {hasImage && (
        <IdentificationSection>
          <SectionTitle>AI識別結果</SectionTitle>
          
          {isIdentifying ? (
            <LoadingSpinner>
              <div>正在分析圖片，請稍候...</div>
            </LoadingSpinner>
          ) : !identificationResult ? (
            <div style={{ textAlign: 'center' }}>
              <Button className="primary" onClick={identifyFish}>
                <FaSearch />
                開始識別
              </Button>
            </div>
          ) : (
            <>
              <ResultCard>
                <ResultTitle>識別結果</ResultTitle>
                <ResultText><strong>物種：</strong>{identificationResult.species}</ResultText>
                <ResultText><strong>信心度：</strong></ResultText>
                <ConfidenceBar>
                  <ConfidenceFill confidence={identificationResult.confidence} />
                </ConfidenceBar>
                <ResultText>{identificationResult.confidence}%</ResultText>
              </ResultCard>

              <ResultCard>
                <ResultTitle>描述</ResultTitle>
                <ResultText>{identificationResult.description}</ResultText>
              </ResultCard>

              <ResultCard>
                <ResultTitle>特徵</ResultTitle>
                <ul>
                  {identificationResult.characteristics.map((char, index) => (
                    <li key={index} style={{ color: '#666', marginBottom: '5px' }}>
                      {char}
                    </li>
                  ))}
                </ul>
              </ResultCard>

              <ResultCard>
                <ResultTitle>棲息地</ResultTitle>
                <ResultText>{identificationResult.habitat}</ResultText>
              </ResultCard>

              <ResultCard>
                <ResultTitle>保護狀況</ResultTitle>
                <ResultText>{identificationResult.conservation}</ResultText>
              </ResultCard>

              {showLocationForm && (
                <LocationForm>
                  <FormTitle>
                    <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                    記錄位置信息
                  </FormTitle>
                  
                  <FormGroup>
                    <Label>緯度</Label>
                    <Input
                      type="text"
                      name="latitude"
                      value={locationData.latitude}
                      onChange={handleLocationChange}
                      placeholder="例如：22.3193"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>經度</Label>
                    <Input
                      type="text"
                      name="longitude"
                      value={locationData.longitude}
                      onChange={handleLocationChange}
                      placeholder="例如：114.1694"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Button className="secondary" onClick={getCurrentLocation}>
                      <FaMapMarkerAlt />
                      獲取當前位置
                    </Button>
                  </FormGroup>

                  <FormGroup>
                    <Label>位置名稱</Label>
                    <Input
                      type="text"
                      name="locationName"
                      value={locationData.locationName}
                      onChange={handleLocationChange}
                      placeholder="例如：南丫島海灘"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>備註</Label>
                    <TextArea
                      name="notes"
                      value={locationData.notes}
                      onChange={handleLocationChange}
                      placeholder="記錄您的觀察筆記..."
                    />
                  </FormGroup>

                  <Button className="success" onClick={saveRecord}>
                    <FaSave />
                    保存記錄
                  </Button>
                </LocationForm>
              )}
            </>
          )}
        </IdentificationSection>
      )}
    </Container>
  );
}

export default FishIdentification;
