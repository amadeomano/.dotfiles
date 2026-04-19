package com.personio.payroll.international.infrastructure.api

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
internal class CorsConfiguration : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry
            .addMapping("/**")
            .allowedOrigins(
                // Local personio-web monorepo orchestrator
                "http://localhost:4200",
            )
            .allowedMethods("*")
    }
}
