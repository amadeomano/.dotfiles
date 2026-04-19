package com.personio.payroll.international.api.http.v1.payrollrun.paygroup

import com.personio.framework.commons.identifiers.CompanyId
import com.personio.payroll.international.api.dto.PayGroupDto
import com.personio.payroll.international.api.http.GatewayWeb
import com.personio.payroll.international.api.http.Response
import com.personio.payroll.international.api.http.toDto
import com.personio.payroll.international.domain.LegalEntityId
import com.personio.payroll.international.domain.authorisation.ActionType.VIEW
import com.personio.payroll.international.domain.authorisation.AuthorisationChecker
import com.personio.payroll.international.domain.authorisation.LEGAL_ENTITY_HEADER
import com.personio.payroll.international.usecases.paygroup.RetrieveAllPayGroupsUseCase
import com.personio.payroll.international.usecases.paygroup.RetrieveAllPayGroupsUseCaseRequest
import com.personio.security.multitenancy.COMPANY_ID_HEADER
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RestController

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@Tag(name = "Payroll Group")
class GetAllPayGroupsEndpoint(
    private val retrieveAllPayGroupsUseCase: RetrieveAllPayGroupsUseCase,
    private val authorisationChecker: AuthorisationChecker,
) {
    @GetMapping("/v1/payrollme/pay-group")
    @Operation(summary = "Retrieve all payroll groups", operationId = "listPayGroups")
    @GatewayWeb
    fun listPayGroups(
        @RequestHeader(COMPANY_ID_HEADER) companyId: CompanyId,
        @RequestHeader(name = LEGAL_ENTITY_HEADER, required = false) legalEntityId: LegalEntityId?,
    ): ResponseEntity<Response<List<PayGroupDto>>> =
        run {
            authorisationChecker.checkAuthorisation(
                companyId = companyId,
                legalEntityId = legalEntityId,
                actionType = VIEW,
            )
            retrieveAllPayGroupsUseCase.execute(
                RetrieveAllPayGroupsUseCaseRequest(companyId = companyId),
            ).let { useCaseResponse ->
                ResponseEntity.ok().body(Response(useCaseResponse.payGroups.map { it.toDto() }))
            }
        }
}
