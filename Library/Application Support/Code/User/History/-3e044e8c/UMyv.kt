import org.springframework.stereotype.Component
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import javax.servlet.Filter
import javax.servlet.FilterConfig
import javax.servlet.ServletException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import java.io.IOException

@Component
class CorsFilter : Filter {

    @Throws(IOException::class, ServletException::class)
    override fun doFilter(
        request: HttpServletRequest, 
        response: HttpServletResponse, 
        chain: FilterChain
    ) {
        // Handle CORS preflight request
        if (request.method.equals("OPTIONS", ignoreCase = true)) {
            response.setHeader("Access-Control-Allow-Origin", "*") 
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
            response.status = HttpServletResponse.SC_OK
        } else {
            chain.doFilter(request, response)
        }
    }

    override fun init(filterConfig: FilterConfig?) {}
    override fun destroy() {}
}