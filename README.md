# K8s Main Service

Servico principal da aplicacao FIAP Tech Challenge rodando em Kubernetes (EKS) - Fase 3.

## Visao Geral

Este repositorio contem o codigo da aplicacao principal e os manifests Kubernetes para deploy no EKS.

### Arquitetura

```
                    +-------------------+
                    |   API Gateway     |
                    | + Lambda Auth     |
                    +--------+----------+
                             |
                    +--------v----------+
                    |       ALB         |
                    | (Ingress Controller)
                    +--------+----------+
                             |
         +-------------------+-------------------+
         |                   |                   |
   +-----v-----+       +-----v-----+       +-----v-----+
   |   Pod 1   |       |   Pod 2   |       |   Pod N   |
   |   (API)   |       |   (API)   |       |   (API)   |
   +-----------+       +-----------+       +-----------+
         |                   |                   |
         +-------------------+-------------------+
                             |
              +--------------+--------------+
              |              |              |
        +-----v-----+  +-----v-----+  +-----v-----+
        |    RDS    |  |  SigNoz   |  |  Secrets  |
        | PostgreSQL|  |   OTel    |  |  Manager  |
        +-----------+  +-----------+  +-----------+
```

## Tecnologias

| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| NestJS | 11.x | Framework Node.js |
| TypeScript | 5.x | Linguagem |
| Prisma | 6.x | ORM |
| PostgreSQL | 15.x | Banco de dados |
| Kubernetes | 1.28 | Orquestracao |
| Kustomize | 5.x | Configuracao K8s |
| OpenTelemetry | - | Observabilidade |

## Pre-requisitos

1. **Node.js** >= 20.0.0
2. **Docker** instalado
3. **kubectl** configurado para o cluster EKS
4. **Kustomize** instalado
5. Infraestrutura provisionada (EKS, RDS, Secrets Manager)

## Desenvolvimento Local

### Instalar dependencias

```bash
npm install
```

### Configurar variaveis de ambiente

```bash
cp .env.example .env
# Editar .env com as configuracoes locais
```

### Executar em modo desenvolvimento

```bash
npm run start:dev
```

### Build

```bash
npm run build
```

### Testes

```bash
npm test
npm run test:cov
npm run test:e2e
```

## Docker

### Build local

```bash
docker build -t fiap-tech-challenge-api:local .
```

### Executar localmente

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  fiap-tech-challenge-api:local
```

## Deploy no Kubernetes

### Via CI/CD (Recomendado)

O deploy automatico ocorre via GitHub Actions:

- Push em `main` → Deploy em production
- Push em `develop` → Deploy em development

### Deploy Manual

```bash
# 1. Configurar kubectl
aws eks update-kubeconfig --region us-east-1 --name fiap-tech-challenge-eks-development

# 2. Build e push da imagem
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/fiap-tech-challenge-api:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fiap-tech-challenge-api:latest

# 3. Deploy com Kustomize
kustomize build k8s/overlays/development | kubectl apply -f -

# 4. Verificar deployment
kubectl rollout status deployment/fiap-tech-challenge-api -n ftc-app
```

## Estrutura de Diretorios

```
k8s-main-service/
├── src/                        # Codigo fonte
│   ├── domain/                 # Entidades e regras de negocio
│   ├── application/            # Casos de uso
│   ├── infrastructure/         # Implementacoes (DB, HTTP)
│   └── interfaces/             # Controllers, DTOs
├── k8s/
│   ├── base/                   # Manifests base
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   ├── external-secret.yaml
│   │   ├── hpa.yaml
│   │   ├── pdb.yaml
│   │   └── kustomization.yaml
│   └── overlays/
│       ├── development/        # Overlay para development
│       └── production/         # Overlay para production
├── prisma/
│   └── schema/                 # Schema do banco de dados
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── Dockerfile
├── package.json
└── README.md
```

## Manifests Kubernetes

| Arquivo | Descricao |
|---------|-----------|
| `deployment.yaml` | Deployment com 2 replicas, rolling update |
| `service.yaml` | ClusterIP service + metrics service |
| `ingress.yaml` | ALB Ingress com HTTPS redirect |
| `configmap.yaml` | Configuracoes nao-sensiveis |
| `external-secret.yaml` | Integracao com AWS Secrets Manager |
| `hpa.yaml` | Autoscaling baseado em CPU/memoria |
| `pdb.yaml` | Pod Disruption Budget (minAvailable: 1) |
| `serviceaccount.yaml` | ServiceAccount com IRSA |

## Observabilidade

### OpenTelemetry

A aplicacao exporta traces, metrics e logs para o SigNoz:

```typescript
// Endpoint configurado via ConfigMap
OTEL_EXPORTER_OTLP_ENDPOINT=http://signoz-otel-collector.signoz.svc.cluster.local:4317
```

### Health Checks

```bash
# Liveness probe
curl http://localhost:3000/health

# Readiness probe
curl http://localhost:3000/health
```

### Metricas

```bash
# Prometheus metrics
curl http://localhost:3000/metrics
```

## Endpoints da API

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/api/v1/clients` | Listar clientes |
| POST | `/api/v1/clients` | Criar cliente |
| GET | `/api/v1/service-orders` | Listar ordens de servico |
| POST | `/api/v1/service-orders` | Criar ordem de servico |
| ... | ... | ... |

## Variaveis de Ambiente

### ConfigMap

| Variavel | Descricao |
|----------|-----------|
| `NODE_ENV` | Ambiente |
| `PORT` | Porta da aplicacao |
| `API_PREFIX` | Prefixo da API |
| `LOG_LEVEL` | Nivel de log |
| `OTEL_*` | Configuracoes OpenTelemetry |

### Secrets (via External Secrets)

| Variavel | Descricao |
|----------|-----------|
| `DATABASE_URL` | Connection string do PostgreSQL |
| `JWT_SECRET` | Secret para JWT |
| `JWT_ACCESS_EXPIRY` | Expiracao do access token |
| `JWT_REFRESH_EXPIRY` | Expiracao do refresh token |

## Troubleshooting

### Ver logs dos pods

```bash
kubectl logs -f -n ftc-app -l app=fiap-tech-challenge-api
```

### Acessar pod para debug

```bash
kubectl exec -it -n ftc-app deployment/fiap-tech-challenge-api -- sh
```

### Ver eventos do deployment

```bash
kubectl describe deployment fiap-tech-challenge-api -n ftc-app
```

### Verificar secrets

```bash
kubectl get externalsecret -n ftc-app
kubectl get secret fiap-tech-challenge-db-secrets -n ftc-app -o yaml
```

### Restart deployment

```bash
kubectl rollout restart deployment/fiap-tech-challenge-api -n ftc-app
```

## Links Relacionados

- [FIAP Tech Challenge - Plano Fase 3](../PHASE-3-PLAN.md)
- [Database Infrastructure](../database-managed-infra)
- [Kubernetes Infrastructure](../kubernetes-core-infra)
- [Lambda API Handler](../lambda-api-handler)

## Equipe

- Ana Shurman
- Franklin Campos
- Rafael Lima (Finha)
- Bruna Euzane

---

**FIAP Pos-Graduacao em Arquitetura de Software - Tech Challenge Fase 3**
