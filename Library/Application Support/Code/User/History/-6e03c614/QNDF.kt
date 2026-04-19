package com.personio.payroll.international.infrastructure.api

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
@Profile("local")
internal class CorsConfiguration : CorsConfigurationSource {
    @Bean
    @Order(Ordered.LOWEST_PRECEDENCE)
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
            }.build()
    }
    override fun addCorsMappings(registry: CorsRegistry) {
        registry
            .addMapping("/**")
            .allowedOrigins(
                // Local personio-web monorepo orchestrator
                "http://localhost:4200",
            ).allowedMethods("*")
    }
}
