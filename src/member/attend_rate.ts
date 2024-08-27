interface AttendRateInfo{
    overture: AttendRateData;
    middle: AttendRateData;
    main: AttendRateData;
}

interface AttendRateData {
    rate: string;
    base: string;
}