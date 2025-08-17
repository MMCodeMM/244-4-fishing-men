import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FaMapMarkerAlt, FaFish, FaInfoCircle, FaFilter, FaPlus } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 修復Leaflet圖標問題
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2.5rem;
`;

const MapControls = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background: white;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
`;

const MapContainerStyled = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  height: 600px;
  position: relative;
`;

const MapInfo = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  color: #666;
  z-index: 1000;
  max-width: 200px;
`;

const Legend = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 5px;
  font-size: 12px;
  color: #666;
  z-index: 1000;
  min-width: 150px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
`;

const StatsSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-top: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  text-align: center;
`;

const StatItem = styled.div`
  padding: 15px;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

// 自定義地圖控制組件
function MapControlsComponent({ onFilterChange, filters }) {
  const map = useMap();

  const flyToHongKong = () => {
    map.flyTo([22.3193, 114.1694], 10);
  };

  const flyToCentral = () => {
    map.flyTo([22.2783, 114.1747], 13);
  };

  const flyToLamma = () => {
    map.flyTo([22.2050, 114.1290], 12);
  };

  return (
    <MapInfo>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>快速導航</div>
      <Button 
        className="secondary" 
        onClick={flyToHongKong}
        style={{ marginBottom: '5px', fontSize: '11px', padding: '5px 8px' }}
      >
        香港島
      </Button>
      <Button 
        className="secondary" 
        onClick={flyToCentral}
        style={{ marginBottom: '5px', fontSize: '11px', padding: '5px 8px' }}
      >
        中環
      </Button>
      <Button 
        className="secondary" 
        onClick={flyToLamma}
        style={{ fontSize: '11px', padding: '5px 8px' }}
      >
        南丫島
      </Button>
    </MapInfo>
  );
}

function Map() {
  const [filters, setFilters] = useState({
    species: 'all',
    dateRange: 'all',
    location: 'all'
  });

  // 模擬魚類發現數據
  const [fishDiscoveries, setFishDiscoveries] = useState([
    {
      id: 1,
      species: '石斑魚',
      scientificName: 'Epinephelus sp.',
      location: [22.2050, 114.1290],
      locationName: '南丫島海灘',
      date: '2024-01-15',
      image: 'https://via.placeholder.com/150x100/667eea/ffffff?text=石斑魚',
      notes: '在淺水區發現，體長約40厘米',
      confidence: 85,
      discoverer: '海洋愛好者'
    },
    {
      id: 2,
      species: '鯛魚',
      scientificName: 'Sparus aurata',
      location: [22.2783, 114.1747],
      locationName: '中環碼頭',
      date: '2024-01-10',
      image: 'https://via.placeholder.com/150x100/28a745/ffffff?text=鯛魚',
      notes: '在碼頭附近發現，體長約25厘米',
      confidence: 92,
      discoverer: '釣魚愛好者'
    },
    {
      id: 3,
      species: '海鱸',
      scientificName: 'Lateolabrax japonicus',
      location: [22.3193, 114.1694],
      locationName: '香港島東部',
      date: '2024-01-08',
      image: 'https://via.placeholder.com/150x100/dc3545/ffffff?text=海鱸',
      notes: '在岩石區域發現，體長約35厘米',
      confidence: 78,
      discoverer: '潛水員'
    },
    {
      id: 4,
      species: '黃花魚',
      scientificName: 'Larimichthys polyactis',
      location: [22.2500, 114.1500],
      locationName: '長洲島',
      date: '2024-01-05',
      image: 'https://via.placeholder.com/150x100/ffc107/ffffff?text=黃花魚',
      notes: '在沙灘附近發現，體長約20厘米',
      confidence: 88,
      discoverer: '遊客'
    }
  ]);

  const [filteredDiscoveries, setFilteredDiscoveries] = useState(fishDiscoveries);

  useEffect(() => {
    let filtered = fishDiscoveries;

    if (filters.species !== 'all') {
      filtered = filtered.filter(discovery => discovery.species === filters.species);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const daysAgo = filters.dateRange === 'week' ? 7 : filters.dateRange === 'month' ? 30 : 365;
      filtered = filtered.filter(discovery => {
        const discoveryDate = new Date(discovery.date);
        const diffTime = Math.abs(now - discoveryDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= daysAgo;
      });
    }

    setFilteredDiscoveries(filtered);
  }, [filters, fishDiscoveries]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getMarkerColor = (confidence) => {
    if (confidence >= 90) return '#28a745';
    if (confidence >= 80) return '#20c997';
    if (confidence >= 70) return '#ffc107';
    return '#dc3545';
  };

  const uniqueSpecies = [...new Set(fishDiscoveries.map(d => d.species))];

  return (
    <Container>
      <Title>魚類發現地圖</Title>

      <MapControls>
        <FilterSection>
          <FilterLabel>
            <FaFilter />
            物種篩選：
          </FilterLabel>
          <Select 
            value={filters.species} 
            onChange={(e) => handleFilterChange('species', e.target.value)}
          >
            <option value="all">所有物種</option>
            {uniqueSpecies.map(species => (
              <option key={species} value={species}>{species}</option>
            ))}
          </Select>

          <FilterLabel>
            <FaInfoCircle />
            時間範圍：
          </FilterLabel>
          <Select 
            value={filters.dateRange} 
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">所有時間</option>
            <option value="week">最近一週</option>
            <option value="month">最近一個月</option>
            <option value="year">最近一年</option>
          </Select>
        </FilterSection>

        <div>
          <Button className="primary">
            <FaPlus />
            添加新發現
          </Button>
        </div>
      </MapControls>

      <MapContainerStyled>
        <MapContainer
          center={[22.3193, 114.1694]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapControlsComponent onFilterChange={handleFilterChange} filters={filters} />

          {filteredDiscoveries.map(discovery => (
            <Marker 
              key={discovery.id} 
              position={discovery.location}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                  background-color: ${getMarkerColor(discovery.confidence)};
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    <FaFish style={{ marginRight: '5px', color: '#667eea' }} />
                    {discovery.species}
                  </h4>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                    <em>{discovery.scientificName}</em>
                  </p>
                  <img 
                    src={discovery.image} 
                    alt={discovery.species}
                    style={{ width: '100%', borderRadius: '5px', margin: '10px 0' }}
                  />
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    <strong>位置：</strong>{discovery.locationName}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    <strong>日期：</strong>{discovery.date}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    <strong>信心度：</strong>{discovery.confidence}%
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    <strong>發現者：</strong>{discovery.discoverer}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    <strong>備註：</strong>{discovery.notes}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <Legend>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>信心度圖例</div>
          <LegendItem>
            <LegendColor color="#28a745" />
            <span>90%+</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#20c997" />
            <span>80-89%</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#ffc107" />
            <span>70-79%</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#dc3545" />
            <span>&lt;70%</span>
          </LegendItem>
        </Legend>
      </MapContainerStyled>

      <StatsSection>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          地圖統計
        </h3>
        <StatsGrid>
          <StatItem>
            <StatNumber>{filteredDiscoveries.length}</StatNumber>
            <StatLabel>發現數量</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{uniqueSpecies.length}</StatNumber>
            <StatLabel>物種種類</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>
              {filteredDiscoveries.length > 0 
                ? Math.round(filteredDiscoveries.reduce((sum, d) => sum + d.confidence, 0) / filteredDiscoveries.length)
                : 0
              }%
            </StatNumber>
            <StatLabel>平均信心度</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>
              {filteredDiscoveries.length > 0 
                ? [...new Set(filteredDiscoveries.map(d => d.locationName))].length
                : 0
              }
            </StatNumber>
            <StatLabel>發現地點</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsSection>
    </Container>
  );
}

export default Map;
