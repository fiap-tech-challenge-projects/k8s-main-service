import { ClientResponseDto, PaginatedClientsResponseDto } from '@application/clients/dto'
import { BasePresenter } from '@shared/bases'

/**
 * HTTP response format for Client data
 */
export interface ClientHttpResponse {
  id: string
  name: string
  email: string
  cpfCnpj: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

/**
 * HTTP response format for paginated Clients
 */
export interface PaginatedClientsHttpResponse {
  data: ClientHttpResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Presenter for Client data formatting
 * Separates business data structure from HTTP response format
 */
export class ClientPresenter extends BasePresenter<ClientResponseDto, ClientHttpResponse> {
  /**
   * Formats Client business data for HTTP response
   * @param client - Client data from application layer
   * @returns Formatted Client for HTTP transport
   */
  present(client: ClientResponseDto): ClientHttpResponse {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      cpfCnpj: client.cpfCnpj,
      phone: client.phone,
      address: client.address,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    }
  }

  /**
   * Formats paginated Clients data for HTTP response
   * @param data - Paginated Clients from application layer
   * @returns Formatted paginated response for HTTP transport
   */
  presentPaginatedClients(data: PaginatedClientsResponseDto): PaginatedClientsHttpResponse {
    return this.presentPaginated(data)
  }
}
