// ========================================
// localStorage 데이터 추출 스크립트
// ========================================
// 
// 사용 방법:
// 1. http://localhost:5173 접속
// 2. F12 키로 개발자 도구 열기
// 3. Console 탭 선택
// 4. 아래 전체 코드를 복사해서 붙여넣기
// 5. Enter 키 누르기
// 6. initial-data.json 파일 다운로드 완료!
//
// ========================================

(function() {
  console.log('%c=== localStorage 데이터 추출 시작 ===', 'color: blue; font-size: 16px; font-weight: bold');
  
  const data = {
    supplierGroupOverrides: [],
    transactionData: {},
    timestamp: new Date().toISOString()
  };

  // 공급업체 그룹 오버라이드 추출
  try {
    const overrides = localStorage.getItem('supplier_group_overrides');
    if (overrides) {
      data.supplierGroupOverrides = JSON.parse(overrides);
      console.log(`%c✅ ${data.supplierGroupOverrides.length}개의 그룹 오버라이드 추출`, 'color: green');
    } else {
      console.log('%c⚠️ 그룹 오버라이드 데이터 없음', 'color: orange');
    }
  } catch (error) {
    console.error('❌ 그룹 오버라이드 추출 실패:', error);
  }

  // 거래 데이터 추출
  try {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('transaction_data_')) {
        const value = localStorage.getItem(key);
        if (value) {
          data.transactionData[key] = JSON.parse(value);
          count++;
        }
      }
    }
    console.log(`%c✅ ${count}개의 거래 데이터 추출`, 'color: green');
  } catch (error) {
    console.error('❌ 거래 데이터 추출 실패:', error);
  }

  // JSON 파일로 다운로드
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'initial-data.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log('%c=== 다운로드 완료! ===', 'color: blue; font-size: 16px; font-weight: bold');
  console.log('%c파일명: initial-data.json', 'color: green');
  console.log('%c다음 단계: 이 파일을 프로젝트의 public 폴더에 복사하세요', 'color: orange; font-weight: bold');
  console.log('');
  console.log('추출된 데이터:');
  console.log('- 그룹 오버라이드:', data.supplierGroupOverrides.length, '개');
  console.log('- 거래 데이터:', Object.keys(data.transactionData).length, '개');
  
  return data;
})();
