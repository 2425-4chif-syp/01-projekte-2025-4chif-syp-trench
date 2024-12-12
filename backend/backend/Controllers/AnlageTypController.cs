using backend.DBContext;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AnlageTypController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnlageTypController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            List<AnlageTyp> AnlageTyp = _context.AnlageTyp.ToList();
            return Ok(AnlageTyp);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var anlageTyp = _context.AnlageTyp.FirstOrDefault(a => a.Typ_Id == id);

            if (anlageTyp == null)
            {
                return NotFound($"AnlageTyp mit Typ_Id {id} wurde nicht gefunden.");
            }

            return Ok(anlageTyp);
        }
    }
}
