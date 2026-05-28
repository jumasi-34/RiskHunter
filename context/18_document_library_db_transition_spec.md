# 📂 18_document_library_db_transition_spec

본 문서는 전사 공통 완성차 고객사(OEM) 기술 규격서 자원(Resource Data)을 고성능 정적 데이터베이스 구조 및 클라이언트 인메모리 스키마로 완전히 전환(Transition)하기 위한 기술 스펙과 설계 매핑 프레임워크를 정의합니다.

---

## 🚀 1. 배경 및 목적 (Background & Objectives)

### ① 기존의 문제점 (As-Is Limitations)
- **정보의 평면성**: 기존 `data/document_library.json`은 모든 파일에 유사한 텍스트 형태소 템플릿("이 문서는 완성차 제조사...")을 사용하여 현장 감사자에게 실질적인 변별력을 주지 못했습니다.
- **타이어 도메인 부재**: 글로벌 OEM 표준서(BMW, GM 등)는 전형적인 '자동차 시스템 및 범용 부품 수준(Generic System Level)'으로 저술되어, 타이어 제조공장 현장의 핵심 설비 제어 파라미터 및 결함 리스크와 연계되지 않았습니다.
- **첫 단계 방어 공정 누락**: 고무 수지, 벨트 와이어, 카본블랙 등 원부자재 수입검사에 관련된 유해 화학 규격 등이 제조 공정 매퍼에서 제외되어 품질 보증 흐름이 단절되었습니다.

### ② 해결책 및 목적 (To-Be Transition Goal)
- **정적 자원의 DB 전환 (Resource to DB Transition)**: 단순 리스크 문서 리스트를 **타이어 제조공정 역해석 매퍼가 탑재된 고도화 데이터베이스 스키마**로 완벽하게 전환합니다.
- **도메인 번역 레이어 (Tire Process Translation)**: 범용 시스템 규격을 타이어 7대 핵심 공정(Incoming, Mixing, Extrusion, Calendaring, Bead, Building, Curing, Inspection)과 직결시켜 실무적 유효성을 격상시킵니다.
- **공정능력의 전체 확산 및 Incoming 명확화**: 공정능력(Cpk) 요구조건은 전 공정 공통(Site-Wide)으로 가시화하고, 원소재 유해 규격은 신설된 `Incoming (수입검사)` 공정에 칼같이 배치하여 데이터 왜곡을 차단합니다.

---

## 🗄️ 2. 데이터베이스 스키마 정의 (Unified Database Schema)

`document_library` 테이블(또는 JSON 로컬 파일 데이터)은 다음 구조로 전면 마이그레이션됩니다.

| 컬럼명 | 데이터 타입 | 필수 여부 | 설명 및 예시 |
| :--- | :--- | :---: | :--- |
| **`id`** | INTEGER (PK) | **Y** | 규격 문서 일련번호 |
| **`filename`** | TEXT (Unique) | **Y** | 실물 파일명 (예: `BMW_GS_98000.pdf`) |
| **`customer`** | TEXT | **Y** | 완성차 고객사 코드 (`BMW`, `Audi`, `HKMC`, `GM` 등) |
| **`doc_code`** | TEXT | **Y** | 규격 문서 표준 코드 (예: `GS 98000`) |
| **`doc_name`** | TEXT | **Y** | 공식 기술 표준 명칭 (국문/영문) |
| **`revision_date`**| TEXT | - | 규격 최신 제/개정 일자 (YYYY-MM-DD 또는 YYYY-MM) |
| **`doc_type`** | TEXT | - | 규격 유형 분류 (예: `품질 표준`, `시험 표준`, `환경 가이드`) |
| **`file_size`** | TEXT | - | 실제 물리 파일 크기 정보 (예: `3.03 MB`, `118 KB`) |
| **`review_summary`**| JSON (Object) | **Y** | **[구조화 요약]** 하부 객체 `overview`, `key_clauses`, `applicable_processes`, `required_evidences` 포함 |
| **`tire_process_translation`** | JSON (Object) | **Y** | **[타이어 공정 역해석]** 하부 객체 `focus_process`, `process_param_check`, `quality_defect_risk`, `action_sop_guide` 포함 |
| **`processed_at`** | TEXT | - | 시스템 데이터 분석 및 파싱 시간 기록 |

---

## ⚙️ 3. 타이어 제조공정 역해석 번역 매트릭스 (Translation Matrix)

글로벌 완성차 요구 사항을 타이어 공장 오디터 관점으로 해석하는 핵심 번역 프레임워크입니다.

```
+------------------------------------+      역해석      +-----------------------------------------+
|     OEM 범용 규격 (System Level)    |   ===========>   |     타이어 공정 및 설비 파라미터 제어     |
+------------------------------------+                  +-----------------------------------------+
|                                    |                  | [Mixing] Mooney 점도 Cpk 제어            |
| 1. 공정능력 보증 (Cpk >= 1.33)      |                  | [Extrusion] 트레드 압출 단면 두께 Cpk     |
|    "전 공정 공통 (Site-Wide)"      |                  | [Curing] 가황 타이어 고무 경화성 Cpk      |
|                                    |                  | [Inspection] 완제품 유니포미티 Cpk       |
+------------------------------------+                  +-----------------------------------------+
|                                    |                  | [Incoming] 입고 원부재 코드/강도 검사    |
| 2. 실수 방지 장치 (Pokayoke)        |                  | [Building] 벨트/카카스 바코드 이종 인터록|
|                                    |                  | [Inspection] 내외관 자동 카메라 검출      |
+------------------------------------+                  +-----------------------------------------+
|                                    |                  | [Incoming] 유해 화학 배합제 COA 검증     |
| 3. 화학/유해 물질 제한 규격        |                  | [Incoming] IMDS 원소재 등록 전산 락       |
+------------------------------------+                  +-----------------------------------------+
```

---

## 📊 4. 10대 핵심 규격서 역해석 마스터 설계

### 1) HKMC ES52930-01 (타이어 일반 규격)
- **범용 요건**: 타이어 완제품 치수, 내압 보증 및 고속 내구성 보증.
- **타이어 공정 역해석**:
  - `focus_process`: `Curing (가황공정) & Inspection (최종검사)`
  - `process_param_check`: 가황 스팀 온도 제어(170°C±2°C) 및 최종검사 유니포미티(Uniformity RFV/LFV) 장비 조기 알람 제어.
  - `quality_defect_risk`: 가황 프레스 가압 편차 시 고무 분자 미경화로 드럼 파괴 시험 중 트레드 박리(Tread Separation) 치명 부적합 발생.
  - `action_sop_guide`: 가황 SOP에 '규격별 가황 가압 하한 모니터링 경보치 및 설비 강제 인터록 연동' 표준 추가.

### 2) BMW GS 98000 (공정능력 연구)
- **범용 요건**: 부품 납품 전/장기 통계적 공정능력(Cpk ≥ 1.33) 검증.
- **타이어 공정 역해석**:
  - `focus_process`: `전 공정 공통 (Site-Wide Process Capability)`
  - `process_param_check`: 배합(Mixing) 공정 Mooney 점도 이력 관리, 압출(Extrusion) Tread 두께 편차 관리, 성형 접합부(Splice) 겹침성 등 주요 특성 통계치 점검.
  - `quality_defect_risk`: 공정 능력 미달 시 전 배합 및 가압 가혹 산포 누적으로 완제품 유니포미티 파괴 및 주행 쏠림으로 대량 불합격 폐기 발생.
  - `action_sop_guide`: 공장 종합 SPC 표준 지침서에 '전 공정 핵심 4M 파라미터별 일일 Cpk 점검 기준' 제정 및 미달 시 개선 가이드(OCAP) 탑재.

### 3) HKMC MS201-02 (유해물질 제한)
- **범용 요건**: 완제품 및 부품의 환경 규제 유해물질 포함 및 금지 규격 준수.
- **타이어 공정 역해석**:
  - `focus_process`: `Incoming (원부재 수입검사)`
  - `process_param_check`: 가황 가속제, 오일 및 고무 배합 수지 화학 성분 성적서(COA) 검증 및 IMDS(국제재료데이터시스템) 일치성 조회.
  - `quality_defect_risk`: REACH 가소제 및 유해 중금속 미필터링 시, 완제품 타이어 생산 가공 후 유럽/북미 친환경 법규 위배로 즉각 수출 금지 및 전량 폐기 위기 직면.
  - `action_sop_guide`: 원부자재 수입검사 SOP에 '유해물질 금지 전수 COA 대조 전산 락 시스템 적용' 및 'IMDS 정기 승인 업데이트 룰' 추가 반영.

### 4) BMW GS 93008-1 (화학 물질 규제)
- **범용 요건**: 유해 물질 제한 및 가소제 전수 제한.
- **타이어 공정 역해석**:
  - `focus_process`: `Incoming (원부재 수입검사)`
  - `process_param_check`: 천연고무(NR) 및 합성고무(SBR) 원료 입고 시 다환방향족탄화수소(PAHs) 미검출 증명서 일대일 검사.
  - `quality_defect_risk`: PAHs 오검출 시 친환경 안전 타이어 인증 마크(E-Mark) 박탈 및 BMW OEM 승인 영구 박탈 리스크 발생.
  - `action_sop_guide`: 수입검사 지침 내 '수입 원소재 로트(Lot)별 환경 유해성 날인 합격 태그 부착 의무화' 수립 개정.

### 5) Honda Session 3.5 (실수방지 장치)
- **범용 요건**: 오조립 및 불량 유출 방지를 위한 Poke-Yoke 설치 및 일일 점검.
- **타이어 공정 역해석**:
  - `focus_process`: `전 공정 공통 (Site-Wide Error-Proofing)`
  - `process_param_check`: 성형(Building) 단계 이종 벨트/플라이 바코드 스캔 인터록 및 수입검사(Incoming) 원자재 바코드 매칭.
  - `quality_defect_risk`: 성형 드럼에 엉뚱한 규격의 코드 및 고무 배합 가공품 조립 시 주행 중 원심력 비대칭으로 사이드월 내부 벨트 박리(Belt Separation) 등 대형 전복 참사 발생.
  - `action_sop_guide`: 성형 작업 SOP 내 '반제품 이종 혼입 방지용 바코드 미스캔 시 구동 드럼 즉시 강제 락(Lock) 체계' 명문화 삽입 및 Red-Rabbit 일일 모의 점검 가이드 삽입.

### 6) Porsche F_360_101 (초고속 내구 테스트)
- **범용 요건**: 실내 고속 주행 드럼 테스트 합격 요건 준수.
- **타이어 공정 역해석**:
  - `focus_process`: `Test (완제품 신뢰성 시험 공정)`
  - `process_param_check`: 샘플 완제품 타이어 파괴 전 실내 챔버 상온 에이징 대기 시간(24시간) 및 내압 정밀 보정 관리.
  - `quality_defect_risk`: 에이징 안정화 누락 시 물성 조기 항복으로 정격 300km/h 고속 영역에서 트레드 청킹(Tread chunking) 또는 사이드월 파열로 가속 시험 탈락.
  - `action_sop_guide`: 완제품 신뢰성 시험 SOP 내 '포르쉐 전용 가속 평가 대기 시 상온 항온항습실 전용 랙 24시간 계류 필수 규정' 가이드 신설 개정.

### 7) Audi LAH 893 010 (신규부품 개발 및 양산품질 계약)
- **범용 요건**: 신규 개발품(PPO) 및 초도품 양산 승인(EMPB) 마일스톤 준증.
- **타이어 공정 역해석**:
  - `focus_process`: `System (품질 시스템 및 신규 규격 PPO 승인)`
  - `process_param_check`: 신규 규격 전용 가황 금형(Mold) 세그먼트 얼라인먼트 점검 및 블래더 내 고압 고온 스팀 안정 가열 능력 승인 검토.
  - `quality_defect_risk`: 가황 프레스 세그먼트 밀착 불량 시 조인트 버(Burr) 대량 발생으로 아우디 외관 오딧 C등급(Downgrade)으로 낙인.
  - `action_sop_guide`: 신규 규격 런칭 수검 가이드 내 '가황 프레스 탈착 시 3개 포인트 온도 정밀 열화상 계측 확인서' 양식을 필수 서류로 규정 반영.

### 8) GM 1927 Global Supplier Manual (글로벌 협력사 가이드)
- **범용 요건**: 양산 승인 런포레이트(Run-at-Rate) 및 초기 전수 검사 GP-12 셋업.
- **타이어 공정 역해석**:
  - `focus_process`: `System (APQP 개발 승인 및 GP-12 유출방지 통제)`
  - `process_param_check`: 최종검사실 앞단 GP-12 오프라인 2차 전수 특별 검사 게이트 설계 및 이력 추적 태그 관리상태 심사.
  - `quality_defect_risk`: 양산 초기 런포레이트 속도 무리한 가속 시 가황 내부 기포 결함(Blister) 발생 및 GP-12 엑스레이 이종 혼입 미필터링 시 대고객 납품 유출 위기 직면.
  - `action_sop_guide`: 최종검사 SOP 지침서 내 'GM 전용 사양 타이어는 양산 승인 통과 즉시 2차 오프라인 특별 검사 대에서 전수 물리 태그 확인 필수' 지침 강제화.

### 9) Ford SCCAF Handbook (공정 특별특성 관리)
- **범용 요건**: 법규 안전 항목 특별특성(SC/CC) 지정 및 관리계획서 일치성 서명.
- **타이어 공정 역해석**:
  - `focus_process`: `System (전 공정 특별특성 관리체계 동기화)`
  - `process_param_check`: 수입 와이어 비드 부위 턴업 장력 계측값(CC 항목) 및 완제품 최종 내압 누설(Air Leak) 전수 합격 프로파일 점검.
  - `quality_defect_risk`: 비드 와이어의 SCCAF 인장 설계 하한치 미달 시 주행 격열 선회 중 비드 이탈(Bead Unseating) 유발로 치명 전복 사고 직결.
  - `action_sop_guide`: 특별특성 연계 지침에 '포드 SCCAF 전용 ∇(역삼각형) 안전 마크 자동 매핑 전산 처리 절차'를 반영하고 SOP 표준서에 등록.

### 10) Stellantis PF.90235 (스텔란티스 완제품 표준)
- **범용 요건**: 완제품 유니포미티 및 제동 성능 내마모 수명 한계선 충족.
- **타이어 공정 역해석**:
  - `focus_process`: `Inspection (최종 완제품 검사 및 균일성 교정)`
  - `process_param_check`: 최종 균일성 측정기(TUM) 축 회전 런아웃(Run-out) 계측 실시간 검교정 상태 점검.
  - `quality_defect_risk`: 센서 오인식 발생 시 정상 품질 타이어가 균일성 미달 폐기 처리되는 수율 저하 발생 또는 불량품 유출로 스텔란티스 고성능 차량 조립 시 조향 소음 컴플레인 직면.
  - `action_sop_guide`: 최종 검사실 표준 SOP 내 '스텔란티스 사양 타이어 측정 가동 시 매 8시간 주기로 마스터 표준 타이어 3회 반복 주행을 통한 센서 자동 제로점 교정' 지침 탑재.

---

## 📅 5. 데이터 전환 및 마이그레이션 계획 (Transition Path)

### [Phase 1: 데이터 셋 배치 단계]
- 마스터 `documents/oe_requirements_list.csv`에 상기 10대 핵심 사양 정보를 비롯한 구조화된 데이터 필드를 가공 병합합니다.
- `data/document_library.json` 파일에 파싱된 신규 10대 데이터 항목을 1:1 대응 정밀 교체 이행합니다.

### [Phase 6: 화면 렌더링 단계]
- `index.html` 내의 `#sub-tab-content-customer-reqs` 서브 탭 본문 영역에 글로벌 OEM 목록 카드를 렌더링하고, 특정 카드 클릭 시 우측의 `lib-summary-panel`에 `tire_process_translation` 데이터(가황, 정련 파라미터, 품질 결함 리스크, SOP 가이드라인)를 동적으로 전개합니다.
- 실제 파일명에 매핑된 파일 용량(`file_size`) 정보를 바인딩하여, [다운로드] 버튼 입력 시 실제 브라우저 파일 로딩 애니메이션과 함께 `/documents/oe_requirements/{filename}` 경로로의 가상 파일 다운로드 세션을 트리거합니다.
