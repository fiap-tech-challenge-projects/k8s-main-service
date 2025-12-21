# k8s-main-service

A production-ready NestJS microservice running on Kubernetes with comprehensive tooling, security, and observability features.

## Features

- 🐳 **Docker containerization** - Multi-stage builds for optimized images
- ☸️ **Kubernetes ready** - Complete manifests with HPA, PDB, and NetworkPolicy
- 📊 **Structured logging** - Winston logger with file rotation
- 🏥 **Health checks** - Liveness and readiness probes for K8s
- 🔒 **Security** - Helmet, environment validation, global exception handling
- 📚 **API Documentation** - Swagger/OpenAPI integration
- 🧪 **Testing** - Jest with coverage thresholds
- 🔍 **Code quality** - ESLint, Prettier, TypeScript strict mode
- 🚀 **CI/CD** - GitHub Actions pipeline with staging and production deploys
- 💾 **Git hooks** - Husky with pre-commit and commit-msg validation

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (optional)
- kubectl (for Kubernetes deployment)

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

### Development

```bash
# Start in watch mode
npm run start:dev

# Run linter
npm run lint

# Run tests
npm run test
npm run test:cov

# Run e2e tests
npm run test:e2e

# Format code
npm run format
```

### Docker

```bash
# Build image
docker build -t k8s-main-service:latest .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f k8s-main-service
```

### Kubernetes Deployment

```bash
# Create namespace and deploy
kubectl apply -f kubernetes/

# Check deployment status
kubectl get deployments -n fiap-services
kubectl get pods -n fiap-services

# View logs
kubectl logs -n fiap-services deployment/k8s-main-service -f

# Scale deployment
kubectl scale deployment k8s-main-service -n fiap-services --replicas=5

# Port forward to test locally
kubectl port-forward -n fiap-services svc/k8s-main-service 3000:80
```

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── environment.ts    # Environment variable validation
│   └── logger.ts         # Winston logger factory
├── filters/          # Global filters
│   └── all-exceptions.filter.ts  # Exception handling
├── middleware/       # Express middleware
│   └── http-logging.middleware.ts # Request/response logging
├── health/           # Health check module
│   ├── health.controller.ts
│   └── health.module.ts
├── app.controller.ts # Main controller
├── app.service.ts    # Main service
├── app.module.ts     # Root module
└── main.ts          # Bootstrap

kubernetes/         # K8s manifests
├── namespace.yaml
├── deployment.yaml
├── service.yaml
├── service-account.yaml
├── hpa.yaml         # Horizontal Pod Autoscaler
├── pdb.yaml         # Pod Disruption Budget
├── configmap.yaml
├── network-policy.yaml
└── kustomization.yaml

.github/workflows/  # CI/CD pipelines
└── ci-cd.yml        # GitHub Actions

Dockerfile          # Multi-stage Docker build
docker-compose.yml  # Local development compose
.env.example        # Environment template
jest.config.js      # Jest configuration
```

## Environment Variables

See [.env.example](.env.example) for all available variables:

```bash
NODE_ENV=development          # Environment: development, production, test
PORT=3000                     # Application port
LOG_LEVEL=debug               # Log level: debug, info, warn, error
SERVICE_NAME=k8s-main-service # Service identifier
SERVICE_VERSION=0.0.1         # Service version
HEALTH_CHECK_ENABLED=true     # Enable health endpoints
SWAGGER_ENABLED=false         # Enable API docs (disable in prod)
```

## API Endpoints

### Health Checks

- `GET /health` - Basic health check
- `GET /health/live` - Liveness probe (K8s)
- `GET /health/ready` - Readiness probe (K8s)

### Application

- `GET /` - Welcome endpoint

### Documentation

- `GET /api/docs` - Swagger UI (if enabled)

## CI/CD Pipeline

### GitHub Actions

The pipeline includes:

1. **Lint & Test** - ESLint, Prettier, unit tests, e2e tests, coverage upload
2. **Build & Push** - Docker build and push to registry
3. **Deploy Staging** - Auto-deploy to staging on `develop` branch
4. **Deploy Production** - Auto-deploy to production on `main` branch
5. **Security Scan** - Trivy vulnerability scanning

### Required Secrets

```bash
KUBE_CONFIG_STAGING      # Base64 encoded kubeconfig for staging
KUBE_CONFIG_PRODUCTION   # Base64 encoded kubeconfig for production
```

Configure in: Settings → Secrets and variables → Actions

## Kubernetes Features

### Deployment

- **Replicas**: 3 minimum (configurable)
- **Rolling updates**: 1 surge, 0 unavailable
- **Resource limits**: CPU 500m, Memory 512Mi
- **Resource requests**: CPU 100m, Memory 128Mi
- **Security context**: Non-root user (1001), read-only filesystem
- **Pod anti-affinity**: Spread across nodes

### Health Probes

- **Liveness** (30s interval): Restarts pod if unhealthy
- **Readiness** (5s interval): Removes from load balancer if not ready
- **Startup delay**: 5-10 seconds

### Auto-scaling (HPA)

- **Min replicas**: 3
- **Max replicas**: 10
- **CPU target**: 70% utilization
- **Memory target**: 80% utilization
- **Scale-up**: Instant (15s period)
- **Scale-down**: Conservative (5m stabilization)

### High Availability

- **Pod Disruption Budget**: Minimum 2 replicas available
- **Network Policy**: Ingress from ingress-nginx, service mesh
- **Service**: ClusterIP (internal only)

## Testing

### Unit Tests

```bash
npm run test
npm run test:watch
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage Thresholds

- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

## Code Quality

### ESLint Rules

- No unused variables
- No explicit `any` types
- Strict TypeScript checks
- JSDoc for public APIs
- Import order enforcement
- Naming conventions

### Formatting

- Prettier auto-format on commit (via husky)
- Semicolons: disabled
- Single quotes: enabled
- Print width: 100 chars
- Tab width: 2 spaces

## Security Best Practices

- ✅ Helmet for HTTP headers
- ✅ Non-root container user
- ✅ Read-only root filesystem
- ✅ Pod security context
- ✅ Network policies
- ✅ Environment validation
- ✅ Global exception handling
- ✅ No sensitive data in logs (prod)

## Logging

Winston logger with:

- **Console output**: Colored, human-readable (development)
- **JSON format**: Structured logging (production)
- **File rotation**: Daily rotation, max 5 files
- **Error logs**: Separate file for errors
- **Timestamps**: ISO 8601 format
- **Request logging**: HTTP method, status, duration, IP

## Troubleshooting

### Build fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tests fail

```bash
# Run with verbose output
npm run test -- --verbose

# Debug specific test
npm run test:debug -- path/to/test.spec.ts
```

### Docker build fails

```bash
# Build with verbose output
docker build --progress=plain -t k8s-main-service .

# Check builder cache
docker buildx du
```

### Kubernetes deployment fails

```bash
# Check pod status
kubectl describe pod <pod-name> -n fiap-services

# View logs
kubectl logs <pod-name> -n fiap-services

# Check events
kubectl get events -n fiap-services --sort-by='.lastTimestamp'
```

## Contributing

1. **Create feature branch**: `git checkout -b feat/my-feature`
2. **Commit changes**: `git commit -m "feat(scope): description"`
3. **Push to remote**: `git push origin feat/my-feature`
4. **Create Pull Request**: Link issues and request review

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

## License

UNLICENSED

## Support

For issues, questions, or suggestions, please create an issue in the repository.
