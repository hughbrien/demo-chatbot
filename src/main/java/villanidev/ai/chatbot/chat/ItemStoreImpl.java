package villanidev.ai.chatbot.chat;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.*;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class ItemStoreImpl implements ItemStore,
        InitializingBean, DisposableBean,
        BeanNameAware, ApplicationContextAware {

    private static final Logger log = LoggerFactory.getLogger(ItemStoreImpl.class);

    private final List<String> items = new CopyOnWriteArrayList<>();
    private String beanName;
    private ApplicationContext applicationContext;

    // ---- Core behavior ----
    @Override public void add(String item) { items.add(item); }
    @Override public boolean delete(String item) { return items.remove(item); }
    @Override public List<String> list() { return List.copyOf(items); }

    // ---- Lifecycle hooks (examples) ----

    // 1) Runs after dependency injection but before the bean is used
    @PostConstruct
    public void postConstruct() {
        log.info("[@PostConstruct] Bean '{}' is ready (items size = {})", beanName, items.size());
    }

    // 2) Spring lifecycle callback
    @Override
    public void afterPropertiesSet() {
        log.info("[InitializingBean.afterPropertiesSet] Bean '{}' initialized", beanName);
    }

    // 3) Custom init method (wired via @Bean(initMethod = \"init\"))
    public void init() {
        log.info("[custom init] Bean '{}' custom init executed", beanName);
    }

    // 4) Runs right before bean destruction
    @PreDestroy
    public void preDestroy() {
        log.info("[@PreDestroy] Bean '{}' is about to be destroyed", beanName);
    }

    // 5) Spring lifecycle callback on destroy
    @Override
    public void destroy() {
        log.info("[DisposableBean.destroy] Bean '{}' DisposableBean destroy called", beanName);
    }

    // 6) Custom destroy method (wired via @Bean(destroyMethod = \"shutdown\"))
    public void shutdown() {
        log.info("[custom destroy] Bean '{}' custom shutdown executed", beanName);
    }

    // ---- Awareness (optional, for demo) ----
    @Override
    public void setBeanName(String name) { this.beanName = name; }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
        log.debug("ApplicationContext set for bean '{}': {}", beanName, applicationContext.getApplicationName());
    }
}
