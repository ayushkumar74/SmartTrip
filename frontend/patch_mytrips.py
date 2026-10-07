import sys

with open('src/pages/MyTrips.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix sorting
content = content.replace(
    'const date = b.type === \'FLIGHT\' ? b.flightBooking?.departureTime : b.hotelBooking?.checkIn;',
    'const date = b.type === \'FLIGHT\' ? b.flightBooking?.departureTime : b.type === \'HOTEL\' ? b.hotelBooking?.checkIn : b.packageBooking?.travelDate;'
)
content = content.replace(
    'const dateA = a.type === \'FLIGHT\' ? a.flightBooking?.departureTime : a.hotelBooking?.checkIn;',
    'const dateA = a.type === \'FLIGHT\' ? a.flightBooking?.departureTime : a.type === \'HOTEL\' ? a.hotelBooking?.checkIn : a.packageBooking?.travelDate;'
)
content = content.replace(
    'const dateB = b.type === \'FLIGHT\' ? b.flightBooking?.departureTime : b.hotelBooking?.checkIn;',
    'const dateB = b.type === \'FLIGHT\' ? b.flightBooking?.departureTime : b.type === \'HOTEL\' ? b.hotelBooking?.checkIn : b.packageBooking?.travelDate;'
)

# Insert renderPackageCard before return
pkg_card = '''  const renderPackageCard = (booking) => {
    const pkg = booking.packageBooking;
    if (!pkg) return null;

    return (
      <Card key={booking.id} className="hover:shadow-lg transition-shadow cursor-pointer border border-theme-border bg-surface overflow-hidden group" onClick={() => navigate(`/my-trips/${booking.id}`)} noPadding>
        <div className="flex flex-col md:flex-row">
          <div className="p-5 flex-1 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-1.5 rounded text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest text-secondary">Holiday Package</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-secondary">Ref: <span className="font-bold text-primary">{booking.bookingReference}</span></span>
                {getStatusBadge(booking.status)}
              </div>
            </div>

            <div className="flex gap-4">
              {pkg.packageImageUrl ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 border border-theme-border hidden sm:block">
                  <img src={pkg.packageImageUrl} alt={pkg.packageName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-slate-100 flex items-center justify-center border border-theme-border shrink-0 hidden sm:flex text-slate-300">
                  <MapPin className="w-8 h-8" />
                </div>
              )}
              
              <div className="flex-1">
                <h4 className="font-black text-lg text-primary leading-tight mb-1">{pkg.packageName}</h4>
                <div className="text-xs font-medium text-secondary flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3 text-muted" /> {pkg.destination}
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Travel Date</div>
                    <div className="font-bold text-primary text-sm">{pkg.travelDate ? new Date(pkg.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}</div>
                  </div>
                  <div className="hidden sm:block text-muted">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Duration</div>
                    <div className="font-bold text-primary text-sm">{pkg.durationDays} Days</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-theme-border flex flex-wrap gap-4 text-xs font-medium text-secondary">
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-muted" /> {pkg.travelers} Traveler(s)</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 md:w-56 flex flex-col justify-between border-t md:border-t-0 md:border-l border-theme-border">
            <div className="text-right flex-row md:flex-col flex justify-between md:justify-start items-center md:items-end mb-4 md:mb-0">
              <span className="text-xs font-bold uppercase tracking-widest text-muted md:mb-1">Total Paid</span>
              <span className="text-xl font-black text-primary">{formatMoney(booking.totalAmount, booking.currency)}</span>
            </div>
            
            <div className="flex flex-col gap-2 mt-4 md:mt-0">
              {activeTab === 'upcoming' && (
                <Button variant="outline" size="sm" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20" onClick={(e) => handleCancelBooking(e, booking.id)}>
                  Cancel Booking
                </Button>
              )}
              <Button size="sm" className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={(e) => { e.stopPropagation(); navigate(`/my-trips/${booking.id}`); }}>
                View Booking
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
'''
content = content.replace('  return (\n    <div className="w-full', pkg_card + '    <div className="w-full')

# Add rendering call
content = content.replace(
    "if (booking.type === 'FLIGHT') return renderFlightCard(booking);",
    "if (booking.type === 'FLIGHT') return renderFlightCard(booking);\n              if (booking.type === 'PACKAGE') return renderPackageCard(booking);"
)

with open('src/pages/MyTrips.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("MyTrips.jsx updated successfully!")
