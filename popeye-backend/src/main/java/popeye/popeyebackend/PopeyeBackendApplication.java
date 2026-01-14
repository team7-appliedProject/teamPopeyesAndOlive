package popeye.popeyebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class PopeyeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PopeyeBackendApplication.class, args);
    }

}
