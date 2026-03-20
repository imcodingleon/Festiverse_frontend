# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start Next.js development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- Jotai (상태관리)
- ESLint 9 with eslint-config-next

## Path Alias

`@/*` maps to project root (`./`). Use `@/app/...`, `@/features/...`, etc.

## Conventions

- 한국어 커뮤니케이션
- Backend API: FastAPI (같은 루트의 Festiverse_backend)

---

# Project Overview

이 프로젝트는 **Next.js 기반 Frontend DDD 아키텍처**를 사용한다.
코드는 **Feature 기반 Layered Architecture** 구조로 구성되어 있으며, 페스티벌/공연 정보 큐레이션 서비스의 프론트엔드이다.

아키텍처 목표

- 비즈니스 로직과 UI 분리
- Feature 단위 모듈화
- Domain 중심 설계
- 유지보수성과 확장성 확보

이 구조는 다음 패턴을 기반으로 한다.

- Clean Architecture
- Domain Driven Design
- Feature Module Architecture

---

# Architecture Overview

프로젝트는 **Feature 기반 Layered Architecture**를 따른다.

```
features/
   festival/
      domain/
      application/
      infrastructure/
      ui/

infrastructure/ (global)
ui/ (design system)
app/ (next router)
```

레이어 의미

```
Domain         → 순수 비즈니스 모델
Application    → 상태 관리 + usecase orchestration
Infrastructure → 외부 시스템 (API, storage)
UI             → React 컴포넌트
```

---

# Dependency Rules

레이어 간 의존성 규칙

```
UI -> Application -> Domain
Infrastructure -> Domain
```

절대 금지

```
Domain -> Application
Domain -> UI
Application -> UI
```

Domain은 **항상 가장 안쪽 레이어**이며
외부 시스템에 의존하지 않는다.

---

# Project Directory Structure

```
src/

features/
   festival/
      domain/
      application/
      infrastructure/
      ui/

ui/
   components/
   layout/

infrastructure/
   http/
   config/

app/
   routing
```

---

# Feature Module Structure

각 Feature는 다음 레이어 구조를 가진다.

```
features/festival/

domain/
application/
infrastructure/
ui/
```

---

# Domain Layer

Domain Layer는 **순수 비즈니스 모델**을 정의한다.

이 레이어는 다음 요소를 포함한다.

```
model
state
intent
```

## Model

```
domain/model/festival.ts
```

Domain Model 특징

- UI와 독립
- API와 독립
- 순수 타입 정의

DDD 관점

```
Entity / Value Object
```

---

## State

```
domain/state/festivalState.ts
```

**Discriminated Union 기반 상태 머신**이다.

상태 공간 예시

```
LOADING
LOADED
ERROR
EMPTY
```

장점

- TypeScript가 상태 안전성 보장
- 런타임 방어 코드 감소

---

## Intent

```
domain/intent/festivalIntent.ts
```

사용자의 **의도(Intent)** 를 정의한다.

예시

```
SEARCH_FESTIVAL
FILTER_BY_REGION
FILTER_BY_DATE
VIEW_DETAIL
```

구조

```
UI Event
   ↓
Intent
   ↓
Command
   ↓
Execution
```

---

# Application Layer

Application Layer는 **시스템의 핵심 로직**을 담당한다.

구성 요소

```
atoms
selectors
commands
hooks
```

---

## Atoms

```
application/atoms/festivalAtom.ts
```

전역 상태를 관리한다.

기술

```
Jotai
```

---

## Selectors

```
application/selectors/festivalSelectors.ts
```

Derived State를 제공한다.

장점

UI에서 상태 조건문을 제거할 수 있다.

---

## Commands

```
application/commands/festivalCommand.ts
```

Command Pattern을 사용한다.

구조

```
Intent -> Command -> Infrastructure
```

---

## Hooks

```
application/hooks/useFestival.ts
```

Application Service 역할을 한다.

책임

```
상태 관리
API orchestration
상태 업데이트
```

구조

```
UI -> useFestival -> API
```

---

# Infrastructure Layer

Infrastructure Layer는 **외부 시스템과 통신**한다.

```
Backend API (FastAPI)
Browser Storage
```

---

## API Adapter

```
features/festival/infrastructure/api/festivalApi.ts
```

Backend API와 통신한다.

기능 예시

```
fetchFestivals
fetchFestivalDetail
searchFestivals
```

이 파일은 **외부 세계 adapter**이다.

---

# Global Infrastructure

## HTTP Client

```
infrastructure/http/httpClient.ts
```

fetch wrapper 역할을 한다.

기능

```
BASE_URL 중앙 관리
공통 에러 처리
```

---

## Environment Config

```
infrastructure/config/env.ts
```

환경 변수 관리

사용 파일

```
.env
.env.local
```

---

# UI Layer

UI Layer는 **React 컴포넌트**를 담당한다.

원칙

- 비즈니스 로직 없음
- 상태 없음
- Side effect 없음

이를 **Dumb Component**라고 한다.

---

## Feature UI

```
features/festival/ui/components
```

예

```
FestivalCard
FestivalDetail
FestivalFilter
```

역할

```
렌더링
이벤트 전달
```

---

## Design System

```
ui/components
```

공통 UI 컴포넌트

예

```
Button
Modal
Navbar
SearchBar
```

특징

```
Stateless
Reusable
Pure UI
```

---

# Layout System

```
ui/layout/AppLayout.tsx
```

구조

```
RootLayout (Server)
   ↓
AppLayout (Client)
   ↓
Navbar
   ↓
Page
```

Next.js 권장 구조이다.

---

# Next App Router Layer

Next.js App Router는 다음 역할을 한다.

```
Routing
SSR
Entry Point
```

여기서는 **Application Hook만 호출한다.**

예

```
useFestival()
```

---

# State Driven UI

UI는 상태 기반으로 동작한다.

예

```
LOADED → 페스티벌 목록 표시
LOADING → 로딩 스피너
EMPTY → "결과 없음" 메시지
ERROR → 에러 메시지
```

---

# Design Principles

이 프로젝트는 다음 원칙을 따른다.

Single Responsibility Principle
Open Closed Principle
Feature Based Architecture
Domain Isolation

---

# Claude Code Working Guidelines

Claude가 이 프로젝트에서 작업할 때 반드시 지켜야 할 규칙

1. Domain Layer 수정 시 외부 의존성 추가 금지
2. UI 컴포넌트에 비즈니스 로직 추가 금지
3. 상태 로직은 Application Layer에만 작성
4. API 호출은 Infrastructure Layer에서만 수행
5. Feature 구조를 깨지 말 것
6. Domain 타입을 중심으로 코드 작성
