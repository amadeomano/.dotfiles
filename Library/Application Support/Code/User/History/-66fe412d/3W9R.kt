package com.personio.payroll.international.infrastructure.api

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.http.HttpMethod;

/**
 * This is needed to allow open api generation task to run successfully & swagger ui access in local,dev
 */
@Configuration
@Profile("local", "dev")
class OpenApiSecurityConfiguration {
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    fun customSecurityFilterChain(httpSecurity: HttpSecurity): SecurityFilterChain {
        val apiDocPatterns =
            arrayOf(
                "/v3/api-docs*/**",
                "/v3/api-docs.yaml",
                "/swagger-ui*/**",
            )
        return httpSecurity
            .securityMatcher(*apiDocPatterns)
            .authorizeHttpRequests {
                it.requestMatchers(*apiDocPatterns).anonymous()
                it.requestMatchers(antMatchers(HttpMethod.OPTIONS, "/**")).permitAll()
            }.build()
    }
}
