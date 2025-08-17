import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaFish, FaMapMarkerAlt, FaCalendar, FaStar, FaEye } from 'react-icons/fa';

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

const SearchSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
`;

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: #555;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ResultsSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const ResultsCount = styled.div`
  color: #666;
  font-size: 16px;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background: white;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const ResultCard = styled.div`
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    border-color: #667eea;
  }
`;

const ResultImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ResultContent = styled.div`
  padding: 20px;
`;

const ResultTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ScientificName = styled.p`
  color: #666;
  font-style: italic;
  margin-bottom: 15px;
  font-size: 14px;
`;

const ResultDetails = styled.div`
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

const ResultDescription = styled.p`
  color: #555;
  line-height: 1.5;
  font-size: 14px;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ResultTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
`;

const Tag = styled.span`
  background: #f8f9fa;
  color: #667eea;
  padding: 4px 8px;
  border-radius: 15px;
  font-size: 12px;
  border: 1px solid #e1e5e9;
`;

const ViewButton = styled.button`
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;

  &:hover {
    background: #5a6fd8;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const NoResultsIcon = styled.div`
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
`;

const QuickSearchSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const QuickSearchTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  text-align: center;
`;

const QuickSearchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const QuickSearchButton = styled.button`
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #555;

  &:hover {
    border-color: #667eea;
    background: #667eea;
    color: white;
    transform: translateY(-2px);
  }
`;

const QuickSearchIcon = styled.div`
  font-size: 2rem;
`;

const QuickSearchText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    species: 'all',
    habitat: 'all',
    conservation: 'all',
    location: 'all'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 模擬魚類數據庫
  const fishDatabase = [
    {
      id: 1,
      name: '石斑魚',
      scientificName: 'Epinephelus sp.',
      image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=石斑魚',
      description: '石斑魚是香港常見的海洋魚類，屬於鮨科。它們通常棲息在珊瑚礁和岩石區域，是重要的商業魚類。',
      habitat: '珊瑚礁',
      conservation: '易危',
      location: '香港東部水域',
      popularity: 95,
      views: 1250,
      tags: ['珊瑚礁', '商業魚類', '大型魚類']
    },
    {
      id: 2,
      name: '鯛魚',
      scientificName: 'Sparus aurata',
      image: 'https://via.placeholder.com/300x200/28a745/ffffff?text=鯛魚',
      description: '鯛魚是一種優質的食用魚，身體呈橢圓形，側扁，頭部較大。在香港水域中較為常見。',
      habitat: '淺海',
      conservation: '無危',
      location: '香港西部水域',
      popularity: 88,
      views: 980,
      tags: ['淺海', '食用魚', '常見']
    },
    {
      id: 3,
      name: '海鱸',
      scientificName: 'Lateolabrax japonicus',
      image: 'https://via.placeholder.com/300x200/dc3545/ffffff?text=海鱸',
      description: '海鱸是一種大型肉食性魚類，喜歡棲息在岩石和珊瑚區域。在香港東部水域較為常見。',
      habitat: '岩石區域',
      conservation: '無危',
      location: '香港東部水域',
      popularity: 82,
      views: 750,
      tags: ['岩石區域', '肉食性', '大型魚類']
    },
    {
      id: 4,
      name: '黃花魚',
      scientificName: 'Larimichthys polyactis',
      image: 'https://via.placeholder.com/300x200/ffc107/ffffff?text=黃花魚',
      description: '黃花魚是一種小型魚類，身體呈金黃色，在香港的沙灘和淺水區域較為常見。',
      habitat: '沙灘',
      conservation: '無危',
      location: '香港南部水域',
      popularity: 75,
      views: 620,
      tags: ['沙灘', '小型魚類', '金黃色']
    },
    {
      id: 5,
      name: '馬鮫魚',
      scientificName: 'Scomberomorus sp.',
      image: 'https://via.placeholder.com/300x200/17a2b8/ffffff?text=馬鮫魚',
      description: '馬鮫魚是一種快速游動的魚類，身體呈流線型，在香港的開放水域中較為常見。',
      habitat: '開放水域',
      conservation: '無危',
      location: '香港南部水域',
      popularity: 70,
      views: 520,
      tags: ['開放水域', '快速游動', '流線型']
    },
    {
      id: 6,
      name: '紅魚',
      scientificName: 'Lutjanus sp.',
      image: 'https://via.placeholder.com/300x200/e83e8c/ffffff?text=紅魚',
      description: '紅魚是一種色彩鮮豔的魚類，通常呈紅色或粉紅色，在香港的珊瑚礁區域較為常見。',
      habitat: '珊瑚礁',
      conservation: '易危',
      location: '香港東部水域',
      popularity: 78,
      views: 680,
      tags: ['珊瑚礁', '色彩鮮豔', '紅色']
    }
  ];

  const performSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // 模擬搜尋延遲
      await new Promise(resolve => setTimeout(resolve, 1000));

      let results = fishDatabase.filter(fish => {
        const matchesQuery = fish.name.toLowerCase().includes(query.toLowerCase()) ||
                           fish.scientificName.toLowerCase().includes(query.toLowerCase()) ||
                           fish.description.toLowerCase().includes(query.toLowerCase()) ||
                           fish.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        const matchesFilters = (filters.species === 'all' || fish.habitat === filters.species) &&
                             (filters.habitat === 'all' || fish.habitat === filters.habitat) &&
                             (filters.conservation === 'all' || fish.conservation === filters.conservation) &&
                             (filters.location === 'all' || fish.location === filters.location);

        return matchesQuery && matchesFilters;
      });

      // 排序結果
      switch (sortBy) {
        case 'popularity':
          results.sort((a, b) => b.popularity - a.popularity);
          break;
        case 'views':
          results.sort((a, b) => b.views - a.views);
          break;
        case 'name':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default: // relevance
          // 保持搜尋結果的相關性排序
          break;
      }

      setSearchResults(results);
    } catch (error) {
      console.error('搜尋失敗:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [filters, sortBy]);

  return (
    <Container>
      <Title>搜尋魚類資訊</Title>

      <SearchSection>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="搜尋魚類名稱、學名、特徵或標籤..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchButton type="submit" disabled={isSearching}>
            <FaSearch />
            {isSearching ? '搜尋中...' : '搜尋'}
          </SearchButton>
        </SearchForm>

        <FilterSection>
          <FilterGroup>
            <FilterLabel>棲息地</FilterLabel>
            <FilterSelect
              value={filters.habitat}
              onChange={(e) => handleFilterChange('habitat', e.target.value)}
            >
              <option value="all">所有棲息地</option>
              <option value="珊瑚礁">珊瑚礁</option>
              <option value="淺海">淺海</option>
              <option value="岩石區域">岩石區域</option>
              <option value="沙灘">沙灘</option>
              <option value="開放水域">開放水域</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>保護狀況</FilterLabel>
            <FilterSelect
              value={filters.conservation}
              onChange={(e) => handleFilterChange('conservation', e.target.value)}
            >
              <option value="all">所有狀況</option>
              <option value="無危">無危</option>
              <option value="易危">易危</option>
              <option value="瀕危">瀕危</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>水域區域</FilterLabel>
            <FilterSelect
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="all">所有區域</option>
              <option value="香港東部水域">香港東部水域</option>
              <option value="香港西部水域">香港西部水域</option>
              <option value="香港南部水域">香港南部水域</option>
            </FilterSelect>
          </FilterGroup>
        </FilterSection>
      </SearchSection>

      <QuickSearchSection>
        <QuickSearchTitle>快速搜尋</QuickSearchTitle>
        <QuickSearchGrid>
          <QuickSearchButton onClick={() => handleQuickSearch('石斑魚')}>
            <QuickSearchIcon>🐟</QuickSearchIcon>
            <QuickSearchText>石斑魚</QuickSearchText>
          </QuickSearchButton>
          <QuickSearchButton onClick={() => handleQuickSearch('珊瑚礁')}>
            <QuickSearchIcon>🏝️</QuickSearchIcon>
            <QuickSearchText>珊瑚礁魚類</QuickSearchText>
          </QuickSearchButton>
          <QuickSearchButton onClick={() => handleQuickSearch('易危')}>
            <QuickSearchIcon>⚠️</QuickSearchIcon>
            <QuickSearchText>易危物種</QuickSearchText>
          </QuickSearchButton>
          <QuickSearchButton onClick={() => handleQuickSearch('大型魚類')}>
            <QuickSearchIcon>🐋</QuickSearchIcon>
            <QuickSearchText>大型魚類</QuickSearchText>
          </QuickSearchButton>
          <QuickSearchButton onClick={() => handleQuickSearch('食用魚')}>
            <QuickSearchIcon>🍽️</QuickSearchIcon>
            <QuickSearchText>食用魚類</QuickSearchText>
          </QuickSearchButton>
          <QuickSearchButton onClick={() => handleQuickSearch('香港東部')}>
            <QuickSearchIcon>🗺️</QuickSearchIcon>
            <QuickSearchText>東部水域</QuickSearchText>
          </QuickSearchButton>
        </QuickSearchGrid>
      </QuickSearchSection>

      <ResultsSection>
        <ResultsHeader>
          <ResultsCount>
            找到 {searchResults.length} 個結果
            {searchQuery && ` (搜尋: "${searchQuery}")`}
          </ResultsCount>
          <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="relevance">相關性</option>
            <option value="popularity">熱門度</option>
            <option value="views">瀏覽量</option>
            <option value="name">名稱</option>
          </SortSelect>
        </ResultsHeader>

        {searchResults.length === 0 && searchQuery ? (
          <NoResults>
            <NoResultsIcon>🔍</NoResultsIcon>
            <h3>沒有找到相關結果</h3>
            <p>請嘗試使用不同的關鍵字或調整篩選條件</p>
          </NoResults>
        ) : (
          <ResultsGrid>
            {searchResults.map(fish => (
              <ResultCard key={fish.id}>
                <ResultImage src={fish.image} alt={fish.name} />
                <ResultContent>
                  <ResultTitle>
                    <FaFish />
                    {fish.name}
                  </ResultTitle>
                  <ScientificName>{fish.scientificName}</ScientificName>
                  
                  <ResultDetails>
                    <DetailItem>
                      <FaMapMarkerAlt />
                      {fish.habitat}
                    </DetailItem>
                    <DetailItem>
                      <FaCalendar />
                      {fish.conservation}
                    </DetailItem>
                    <DetailItem>
                      <FaStar />
                      {fish.popularity}%
                    </DetailItem>
                    <DetailItem>
                      <FaEye />
                      {fish.views}
                    </DetailItem>
                  </ResultDetails>

                  <ResultDescription>{fish.description}</ResultDescription>
                  
                  <ResultTags>
                    {fish.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </ResultTags>

                  <ViewButton>查看詳情</ViewButton>
                </ResultContent>
              </ResultCard>
            ))}
          </ResultsGrid>
        )}
      </ResultsSection>
    </Container>
  );
}

export default Search;
