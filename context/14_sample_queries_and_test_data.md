# 💾 [Context 14] SQL Console Safe Templates & Sandbox Rules

본 문서는 **7. Admin Settings** 탭에 임베딩되는 **가상 SQL Console**의 구동용 쿼리 템플릿 6종 명세서 및 데이터 쓰기 파괴 동작을 원천 봉쇄하는 보안 샌드박스 정규식 규칙 정의서입니다.

---

## 🔒 1. SELECT-Only 안전 보안 샌드박스 규칙 (Security Sandbox)

본 가상 콘솔은 프론트엔드 단독 데이터프레임 가상 뷰어 형태로 구동되며, 클라이언트의 마스터 정적 JSON 데이터를 절대 훼손할 수 없도록 설계된 **안전 SELECT 전용 샌드박스** 상태를 전제로 작동합니다.

### ① 쓰기 차단 감지 차단 정규식 (Write Block Regular Expression)
사용자가 SQL 에디터 영역에 직접 구문을 타이핑한 뒤 실행을 시도할 때, 대소문자 구분 없이 다음 키워드의 기입 여부를 선제적으로 스캔하여 강제 차단합니다.

```javascript
// app.js 내 탑재될 보안 정규식 표준 룰
const sqlWriteBlockRegex = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE|RENAME|GRANT|REVOKE)\b/i;
```

### ② 차단 작동 메커니즘
1.  **스캔 트리거**: 에디터 영역에서 [실행 (Run Query)] 버튼 클릭 시 작동.
2.  **보안 인터셉트**: 위의 정규식에 일치하는 문구가 1개라도 감출 시 자바스크립트는 데이터 가상 렌더러 동작을 즉시 거부(Block)합니다.
3.  **UI 알럿 인서트**: "SELECT 전용 안전 샌드박스 상태입니다. 원천 마스터 데이터의 보존 및 보안 유지를 위해 쓰기/수정 행위는 전면 금지됩니다"라는 경고 모달 알림창을 시각적으로 강하게 팝오버 노출합니다.

---

## 📊 2. SQL 템플릿 6대 마스터 쿼리 스펙 (Template Queries)

사용자가 원클릭으로 불러와 실행할 수 있는 고해상도 가상 쿼리 목록과, 해당 쿼리 실행 시 즉각 화면 하단 데이터프레임 표에 바인딩되어 출력될 모의 결과 JSON 데이터셋 정의입니다.

### Q1. 전사 고위험 공장 및 공정 리스트 추적 (CRI 스코어 내림차순)
*   **SQL 구문**:
    ```sql
    SELECT plant_code, process_name, risk_score, risk_level 
    FROM virtual_plant_risk 
    WHERE risk_score >= 3.5 
    ORDER BY risk_score DESC;
    ```
*   **가상 결과 데이터셋 (JSON)**:
    ```json
    [
      {"plant_code": "KP", "process_name": "가류 (Curing)", "risk_score": 4.1, "risk_level": "CRITICAL"},
      {"plant_code": "KP", "process_name": "압출 (Extruding)", "risk_score": 3.8, "risk_level": "CRITICAL"},
      {"plant_code": "DP", "process_name": "성형 (Building)", "risk_score": 3.6, "risk_level": "CRITICAL"},
      {"plant_code": "HP", "process_name": "정밀 검사 (Inspection)", "risk_score": 3.5, "risk_level": "CRITICAL"}
    ]
    ```

### Q2. 현대차(HMC) 전용 미결 지적사항 현황
*   **SQL 구문**:
    ```sql
    SELECT audit_id, plant_code, point_out, status 
    FROM customer_audits 
    WHERE customer_name = 'HMC' AND status = 'OPEN';
    ```
*   **가상 결과 데이터셋 (JSON)**:
    ```json
    [
      {"audit_id": "AUD-HMC-2026-01", "plant_code": "KP", "point_out": "가류 스팀 온도 임계치 제어 인터락 설정 미흡", "status": "OPEN"},
      {"audit_id": "AUD-HMC-2026-03", "plant_code": "CP", "point_out": "성형 그린타이어 트레드 단차 조립 공차 규정 미달", "status": "OPEN"}
    ]
    ```

### Q3. 공장별 누적 과거 품질 실패(QI) 사건 건수 통계
*   **SQL 구문**:
    ```sql
    SELECT plant_code, COUNT(issue_id) AS qi_total_count 
    FROM quality_issues 
    GROUP BY plant_code 
    ORDER BY qi_total_count DESC;
    ```
*   **가상 결과 데이터셋 (JSON)**:
    ```json
    [
      {"plant_code": "KP", "qi_total_count": 18},
      {"plant_code": "DP", "qi_total_count": 12},
      {"plant_code": "JP", "qi_total_count": 9},
      {"plant_code": "CP", "qi_total_count": 5}
    ]
    ```

### Q4. GM 오딧 수검 지적사항 중 조치 완료(CLOSED) 내역
*   **SQL 구문**:
    ```sql
    SELECT audit_id, process_name, point_out, resolved_at 
    FROM customer_audits 
    WHERE customer_name = 'GM' AND status = 'CLOSED';
    ```
*   **가상 결과 데이터셋 (JSON)**:
    ```json
    [
      {"audit_id": "AUD-GM-2025-11", "process_name": "정밀 검사 (Inspection)", "point_out": "X-Ray 기포 자동 판정 알고리즘 보정 미비", "resolved_at": "2026-02-14"}
    ]
    ```

### Q5. 4M 공정 변경점 등록 건수 요약
*   **SQL 구문**:
    ```sql
    SELECT plant_code, change_type, COUNT(change_id) AS change_count 
    FROM change_management 
    GROUP BY plant_code, change_type;
    ```
*   **가상 결과 데이터셋 (JSON)**:
    ```json
    [
      {"plant_code": "KP", "change_type": "Machine (설비 교체)", "change_count": 14},
      {"plant_code": "KP", "change_type": "Man (인적 미스 예방 교육)", "change_count": 8},
      {"plant_code": "DP", "change_type": "Material (고무 원재료 변경)", "change_count": 11}
    ]
    ```

### Q6. 사내 상시 내부 Audit 점수 분석 (80점 이하 집중 관리 공장)
*   **SQL 구문**:
    ```sql
    SELECT plant_code, audit_date, score 
    FROM internal_audits 
    WHERE score <= 80 
    ORDER BY score ASC;
    ```
*   **가상 결과 데이터셋 (JSON)**:
    ```json
    [
      {"plant_code": "KP", "audit_date": "2026-04-18", "score": 72},
      {"plant_code": "HP", "audit_date": "2026-05-02", "score": 78}
    ]
    ```
