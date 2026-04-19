package com.personio.payroll.international.infrastructure.api

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

/**
 * This CORS config is needed to allow local host calls from personio-web orchestrator to be allowed
 */
@Configuration
@Profile("local")
class LocalDevCorsSecurityConfiguration {
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        // Local personio-web monorepo orchestrator - localhost:4200
        configuration.allowedOrigins = listOf("http://localhost:4200")
        configuration.allowedMethods = listOf("*")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    @Order(Ordered.LOWEST_PRECEDENCE)
    fun globalSecurityFilterChain(httpSecurity: HttpSecurity): SecurityFilterChain {
        return httpSecurity
            .cors()
            .configurationSource(corsConfigurationSource()).and()
            .build()
    }
}
