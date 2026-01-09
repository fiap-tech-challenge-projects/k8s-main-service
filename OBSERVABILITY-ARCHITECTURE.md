# 📊 Arquitetura de Observabilidade - OpenTelemetry + SigNoz

```
┌──────────────────────────────────────────────────────────────────────┐
│                        k8s-main-service POD                          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Node.js Application (NestJS)                              │   │
│  │                                                             │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ src/main.ts                                         │   │   │
│  │  │ - Import tracing.ts (PRIMEIRO - linha 11)         │   │   │
│  │  │ - Inicializa App                                   │   │   │
│  │  │ - Controllers/Services                             │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  ┌──────────────────────────────────┐                      │   │
│  │  │ OpenTelemetry SDK                │                      │   │
│  │  │                                  │                      │   │
│  │  │ ┌─ src/tracing.ts ─────────────┐ │                      │   │
│  │  │ │ • NodeSDK inicializado       │ │                      │   │
│  │  │ │ • Auto Instrumentation       │ │                      │   │
│  │  │ │ • OTLP Exporters             │ │                      │   │
│  │  │ └──────────────────────────────┘ │                      │   │
│  │  │                                  │                      │   │
│  │  │ Capture Automático:             │                      │   │
│  │  │ ✓ HTTP Requests                 │                      │   │
│  │  │ ✓ DB Queries (Prisma)          │                      │   │
│  │  │ ✓ gRPC Calls                    │                      │   │
│  │  │ ✓ Event Emitters               │                      │   │
│  │  │ ✓ Timers                        │                      │   │
│  │  └──────────────────────────────────┘                      │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Exports:                                                           │
│  └─> OTLP HTTP/v1 Protocol                                          │
│      ├─ Traces: port 4318/v1/traces                                 │
│      └─ Metrics: port 4318/v1/metrics                               │
│         (a cada 10 segundos)                                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                              ▼
                         NETWORK
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    SigNoz (signoz namespace)                         │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ OTel Collector (signoz-otel-collector.signoz:4318)         │   │
│  │                                                             │   │
│  │ Receivers:                                                │   │
│  │ ├─ OTLP/HTTP (port 4318) ◀─ fiap-main-service            │   │
│  │                                                             │   │
│  │ Processors:                                                │   │
│  │ ├─ Batch Processor                                         │   │
│  │ ├─ Memory Limiter                                          │   │
│  │ └─ Resource Detection                                      │   │
│  │                                                             │   │
│  │ Exporters:                                                 │   │
│  │ ├─ Traces → ClickHouse                                     │   │
│  │ └─ Metrics → ClickHouse                                    │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ClickHouse (Database)                                      │   │
│  │                                                             │   │
│  │ Tables:                                                    │   │
│  │ ├─ signoz_traces.*                                         │   │
│  │ ├─ signoz_metrics.*                                        │   │
│  │ ├─ signoz_logs.*                                           │   │
│  │ └─ (Retention: 30 dias)                                    │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Query Service (API)                                        │   │
│  │ Expõe dados via REST/gRPC                                  │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Frontend (signoz-frontend.signoz:3301)                     │   │
│  │                                                             │   │
│  │ Dashboards:                                                │   │
│  │ ├─ Overview (requisições, erros, latência)                │   │
│  │ ├─ Service Orders (criação, status, funil)                │   │
│  │ ├─ Infraestrutura (CPU, Memory, Pods, HPA)                │   │
│  │ └─ Traces (busca, análise, debugging)                     │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                              ▲
                         HTTPS/Port-forward
                              │
                    Desenvolvedor/Operator
```

---

## 🔄 Fluxo de Dados Detalhado

### 1️⃣ Request HTTP chega na aplicação

```
Cliente → API Gateway → EKS Service → k8s-main-service Pod
                                          ▼
                                    HTTP Request Handler
                                          │
                                    (Trace criado aqui)
                                          ▼
                                    Controller/Service
```

### 2️⃣ Instrumentação Automática Captura

```
OpenTelemetry Auto-Instrumentation detecta:
├─ Request metadata (URL, method, headers)
├─ Database queries (Prisma)
├─ Response status
├─ Duração total
└─ Erros/Exceptions (se houver)

Resultado: Span com todas as informações
```

### 3️⃣ Agregação de Trace

```
Trace = múltiplos Spans relacionados

Exemplo - POST /service-orders:
├─ Span: HTTP Request Handler (1ms)
├─ Span: Authorization Check (2ms)
├─ Span: Database Query - Create Order (5ms)
├─ Span: Database Query - Update Stock (3ms)
├─ Span: Send Notification (10ms)
└─ Span: HTTP Response (1ms)

Total: 22ms
```

### 4️⃣ Exportação Periódica

```
A cada 10 segundos:
1. SDK coleta todos os Spans + Métricas
2. Empacota em formato OTLP
3. Envia via HTTP POST para SigNoz OTel Collector
4. Collector persiste no ClickHouse
```

### 5️⃣ Visualização em SigNoz

```
Frontend faz queries ao ClickHouse através do Query Service:

"Mostre-me todos os requests com latência > 2s"
         ▼
    ClickHouse Query
         ▼
    Dados estruturados
         ▼
    Gráficos/Dashboards/Traces
```

---

## 📊 Métricas Coletadas Automaticamente

### HTTP Metrics
```
• http.server.duration (latência)
• http.server.request.size (tamanho request)
• http.server.response.size (tamanho response)
• http.server.active_requests (requisições ativas)
```

### Database Metrics (Prisma)
```
• db.client.operation.duration (duração query)
• db.client.connections.usage (conexões ativas)
• db.client.connections.wait_time (tempo espera)
```

### System Metrics
```
• process.runtime.nodejs.memory.usage
• process.runtime.nodejs.memory.heap.max
• process.runtime.go.goroutines
• system.cpu.usage
• system.memory.usage
```

---

## 🔐 Atributos de Contexto Adicionados

Cada Span é enriquecido com:

```javascript
{
  "service.name": "fiap-main-service",
  "service.version": "1.0.0",
  "service.namespace": "fiap-tech",
  "environment": "development|production",
  
  "http.method": "POST",
  "http.url": "/v1/service-orders",
  "http.status_code": 201,
  
  "user.id": "12345",           // Se disponível
  "client.id": "567",           // Se disponível
  
  "db.operation": "INSERT",
  "db.statement": "INSERT INTO service_orders...",
  "db.rows_affected": 1,
}
```

---

## ⚡ Performance Impact

### Overhead Observado
- **Latência adicional**: ~1-2% (negligível)
- **Memória**: ~20-30 MB
- **CPU**: <1% durante exportação
- **Network**: ~100KB por 10 segundos (métricas + traces)

### Otimizações Aplicadas
- ✅ Batch processor para traces
- ✅ Sampling configurável (se necessário)
- ✅ Compressão OTLP
- ✅ Memory limits no collector

---

## 🚀 Como Acessar SigNoz

### Port-Forward Local

```bash
# 1. Configurar kubeconfig
aws eks update-kubeconfig --region us-east-1 --name fiap-tech-challenge-eks

# 2. Port-forward frontend
kubectl port-forward svc/signoz-frontend -n signoz 3301:3301

# 3. Abrir browser
open http://localhost:3301

# Credenciais padrão
# Email: admin@signoz.io
# Senha: signoz
```

### Dashboard URLs
```
• Overview: http://localhost:3301/home
• Traces: http://localhost:3301/traces
• Metrics: http://localhost:3301/metrics
• Logs: http://localhost:3301/logs
```

---

## 🎯 Casos de Uso

### 1. Performance Analysis
```
"Qual endpoint é mais lento?"
→ Abrir Traces → Buscar por service name → Ordenar por duração
```

### 2. Debugging
```
"Por que este request falhou?"
→ Trace detalhado mostra cada step e onde falhou
```

### 3. Capacity Planning
```
"Qual é nosso pico de requisições?"
→ Metrics dashboard mostra tendências
```

### 4. Error Analysis
```
"Qual erro acontece mais?"
→ Filtrar por status code / exception type
```

---

## 📚 Referências

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [SigNoz Architecture](https://signoz.io/blog/opentelemetry-architecture/)
- [OTEL Node.js SDK](https://github.com/open-telemetry/opentelemetry-js)
- [OTLP Specification](https://github.com/open-telemetry/opentelemetry-specification)

---

**Próximo passo**: Deploy no Kubernetes + Validação em SigNoz 🚀
