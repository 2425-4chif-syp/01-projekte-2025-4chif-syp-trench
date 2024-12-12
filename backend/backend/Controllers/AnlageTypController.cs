using Microsoft.AspNetCore.Mvc;
using backend.Entities;
using backend.Services;
using ConsoleDB.Interface;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnlageController : ControllerBase
    {
        private readonly IAnlageService _anlageService;

        public AnlageController(IAnlageService anlageService)
        {
            _anlageService = anlageService;
        }

        // GET api/anlage/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AnlageTyp>> Get(int id)
        {
            var anlage = await _anlageService.GetAnlageById(id);
            if (anlage == null)
            {
                return NotFound(); 
            }
            return Ok(anlage); 
        }
    }
}
