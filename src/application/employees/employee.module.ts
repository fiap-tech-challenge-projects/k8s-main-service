import { Module } from '@nestjs/common'

import { EmployeePresenter } from '@application/employees/presenters'
import {
  ActivateEmployeeUseCase,
  CheckEmailAvailabilityUseCase,
  CreateEmployeeUseCase,
  DeactivateEmployeeUseCase,
  DeleteEmployeeUseCase,
  GetActiveEmployeesUseCase,
  GetAllEmployeesUseCase,
  GetEmployeeByEmailUseCase,
  GetEmployeeByIdUseCase,
  GetInactiveEmployeesUseCase,
  SearchEmployeesByNameUseCase,
  SearchEmployeesByRoleUseCase,
  UpdateEmployeeUseCase,
} from '@application/employees/use-cases'
import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

/**
 * Employee application module
 */
@Module({
  imports: [InfraModule, SharedModule],
  providers: [
    EmployeePresenter,
    ActivateEmployeeUseCase,
    CheckEmailAvailabilityUseCase,
    CreateEmployeeUseCase,
    DeactivateEmployeeUseCase,
    DeleteEmployeeUseCase,
    GetActiveEmployeesUseCase,
    GetAllEmployeesUseCase,
    GetEmployeeByEmailUseCase,
    GetEmployeeByIdUseCase,
    GetInactiveEmployeesUseCase,
    SearchEmployeesByNameUseCase,
    SearchEmployeesByRoleUseCase,
    UpdateEmployeeUseCase,
  ],
  exports: [
    EmployeePresenter,
    ActivateEmployeeUseCase,
    CheckEmailAvailabilityUseCase,
    CreateEmployeeUseCase,
    DeactivateEmployeeUseCase,
    DeleteEmployeeUseCase,
    GetActiveEmployeesUseCase,
    GetAllEmployeesUseCase,
    GetEmployeeByEmailUseCase,
    GetEmployeeByIdUseCase,
    GetInactiveEmployeesUseCase,
    SearchEmployeesByNameUseCase,
    SearchEmployeesByRoleUseCase,
    UpdateEmployeeUseCase,
  ],
})
export class EmployeeApplicationModule {}
