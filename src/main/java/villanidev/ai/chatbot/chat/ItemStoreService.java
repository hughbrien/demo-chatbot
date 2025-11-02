package villanidev.ai.chatbot.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.Collection;
import java.util.List;

@Service
@Validated
public class ItemStoreService {

    private static final Logger log = LoggerFactory.getLogger(ItemStoreService.class);

    private final ItemStore itemStore;

    public ItemStoreService(ItemStore itemStore) {
        this.itemStore = itemStore;
    }

    /** Add an item (ignores leading/trailing whitespace). No-ops on empty after trim. */
    public boolean addItem(@NotBlank String item) {
        String normalized = item.trim();
        if (normalized.isEmpty()) {
            log.debug("Skipping add: blank item");
            return false;
        }
        // Optional de-dupe policy (comment out if duplicates are allowed)
        if (exists(normalized)) {
            log.debug("Skipping add: '{}' already exists", normalized);
            return false;
        }
        itemStore.add(normalized);
        log.info("Added item: '{}'", normalized);
        return true;
    }

    /** Add many items; returns count successfully added. */
    public int addAll(@NotNull Collection<String> items) {
        int added = 0;
        for (String i : items) {
            if (i != null && addItem(i)) added++;
        }
        return added;
    }

    /** Remove an item (after trim). */
    public boolean removeItem(@NotBlank String item) {
        String normalized = item.trim();
        boolean removed = itemStore.delete(normalized);
        if (removed) {
            log.info("Removed item: '{}'", normalized);
        } else {
            log.debug("Remove failed: '{}' not found", normalized);
        }
        return removed;
    }

    /** List all items (immutable snapshot). */
    public List<String> listItems() {
        return itemStore.list();
    }

    /** Convenience helper. */
    public boolean exists(@NotBlank String item) {
        String normalized = item.trim();
        return itemStore.list().contains(normalized);
    }

    /** Clear all items (optional helper). */
    public int clear() {
        List<String> current = itemStore.list();
        int size = current.size();
        for (String i : current) {
            itemStore.delete(i);
        }
        log.info("Cleared {} items", size);
        return size;
    }
}