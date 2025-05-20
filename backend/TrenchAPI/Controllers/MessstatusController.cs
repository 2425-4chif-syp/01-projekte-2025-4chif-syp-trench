using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrenchAPI.Core.Entities;
using TrenchAPI.Persistence;

namespace TrenchAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessstatusController : ControllerBase
    {
        private readonly WebDbContext _context;

        public MessstatusController(WebDbContext context)
        {
            _context = context;
        }

        // GET: api/Messstatus
        [HttpGet]
        public async Task<ActionResult<Messstatus>> GetAktiveMessung()
        {
            var messung = await _context.Messstatus
                .Include(m => m.Messeinstellung)
                .ThenInclude(me => me.Spule)
                .ThenInclude(s => s.SpuleTyp)
                .Include(m => m.Messeinstellung)
                .ThenInclude(me => me.SondenTyp)
                .FirstOrDefaultAsync(m => m.IsActive);

            if (messung == null)
                return NotFound();

            return messung;
        }
    }
} 