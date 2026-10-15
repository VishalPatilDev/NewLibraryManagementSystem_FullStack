package com.pjsofttech.library.service.impl;

import com.pjsofttech.library.dto.request.BookCopyRequest;
import com.pjsofttech.library.dto.request.RackRequest;
import com.pjsofttech.library.dto.response.BookCopyResponse;
import com.pjsofttech.library.dto.response.RackResponse;
import com.pjsofttech.library.exception.BusinessException;
import com.pjsofttech.library.exception.DuplicateResourceException;
import com.pjsofttech.library.exception.ResourceNotFoundException;
import com.pjsofttech.library.model.BookCopy;
import com.pjsofttech.library.model.Rack;
import com.pjsofttech.library.repository.RackRepository;
import com.pjsofttech.library.service.RackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RackServiceImpl implements RackService {

    private final RackRepository rackRepository;

    @Override
    @Transactional
    public RackResponse create(RackRequest request) {

        if (rackRepository.existsByRackCodeIgnoreCase(request.getRackCode())) {
            throw new DuplicateResourceException("Rack code '" + request.getRackCode() + "' already exists");
        }
        Rack rack = Rack.builder()
                .rackCode(request.getRackCode().toUpperCase())
                .label(request.getLabel())
                .section(request.getSection())
                .floorSection(request.getFloorSection())
                .rowNumber(request.getRowNumber())
                .totalCapacity(request.getTotalCapacity())
                .description(request.getDescription())
                .build();
        Rack saved = rackRepository.save(rack);

        log.info("Rack created: {}", saved.getRackCode());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RackResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RackResponse> getAll() {
        return rackRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RackResponse> search(String keyword) {
        return rackRepository.search(keyword).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public RackResponse update(Long id, RackRequest request) {
        Rack rack = findById(id);
        if (!rack.getRackCode().equalsIgnoreCase(request.getRackCode())
                && rackRepository.existsByRackCodeIgnoreCase(request.getRackCode())) {
            throw new DuplicateResourceException("Rack code '" + request.getRackCode() + "' already exists");
        }
        long currentBookCount = rackRepository.countBooksInRack(id);

        if (request.getTotalCapacity() != null
                && request.getTotalCapacity() < currentBookCount) {

            throw new BusinessException(
                    "Rack capacity cannot be less than the current number "
                            + "of book copies (" + currentBookCount + ")."
            );
        }

        rack.setRackCode(request.getRackCode().toUpperCase());
        rack.setLabel(request.getLabel());
        rack.setSection(request.getSection());
        rack.setFloorSection(request.getFloorSection());
        rack.setRowNumber(request.getRowNumber());
        rack.setTotalCapacity(request.getTotalCapacity());
        rack.setDescription(request.getDescription());
        Rack updated = rackRepository.save(rack);

        log.info("Rack updated: {}", updated.getRackCode());

        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Rack rack = findById(id);
        long count = rackRepository.countBooksInRack(id);
        if (count > 0) {
            throw new BusinessException("Cannot delete rack '" + rack.getRackCode()
                    + "' — it contains " + count + " book copies. Relocate them first.");
        }
        rackRepository.delete(rack);
        log.info("Rack deleted: {}", rack.getRackCode());
    }

    private Rack findById(Long id) {
        return rackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rack", id));
    }

    public RackResponse toResponse(Rack r) {
        long currentBookCount = rackRepository.countBooksInRack(r.getId());
        Integer totalCapacity = r.getTotalCapacity();

        long availableCapacity = totalCapacity == null
                ? 0
                : Math.max(0, totalCapacity - currentBookCount);

        double occupancyPercentage = totalCapacity == null || totalCapacity <= 0
                ? 0.0
                : Math.min(
                100.0,
                (currentBookCount * 100.0) / totalCapacity
        );

        return RackResponse.builder()
                .id(r.getId())
                .rackCode(r.getRackCode())
                .label(r.getLabel())
                .section(r.getSection())
                .floorSection(r.getFloorSection())
                .rowNumber(r.getRowNumber())
                .totalCapacity(totalCapacity)
                .currentBookCount(currentBookCount)
                .availableCapacity(availableCapacity)
                .occupancyPercentage(
                        Math.round(occupancyPercentage * 100.0) / 100.0
                )
                .bookCopyResponses(toBookCopyResponseList(r.getBookCopies()))
                .description(r.getDescription())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private List<BookCopyResponse> toBookCopyResponseList(List<BookCopy> bookCopies){
        return bookCopies.stream()
                .map(bookCopy -> {
                    return BookCopyResponse.builder()
                            .bookTitle(bookCopy.getBook().getTitle())
                            .barcode(bookCopy.getBarcode())
                            .rackId(bookCopy.getRack().getId())
                            .rackCode(bookCopy.getRack().getRackCode())
                            .shelfLocation(bookCopy.getShelfLocation())
                            .purchaseDate(bookCopy.getPurchaseDate())
                            .status(bookCopy.getStatus())
                            .build();
                }
                ).toList();

    }
}