def classify_shape(width: int, height: int) -> str:
    """Buckets an image into one of three jigsaw tile shapes based on its
    real aspect ratio. Thresholds are deliberately simple — tune these two
    numbers against real client uploads rather than the algorithm itself.
    """
    if height <= 0:
        return "normal"
    ratio = width / height

    if ratio >= 1.6:
        return "banner"  # wide — spans 2 grid columns
    if ratio <= 0.7:
        return "tall"  # portrait — spans 2 grid rows
    return "normal"  # roughly square — 1x1
