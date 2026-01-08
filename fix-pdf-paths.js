import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPdfPaths() {
  try {
    // Get all pickups with PDF paths
    const pickups = await prisma.pickup.findMany({
      where: {
        pdfPath: {
          not: null,
        },
      },
    });

    console.log(`Found ${pickups.length} pickups with PDF paths`);

    for (const pickup of pickups) {
      const oldPath = pickup.pdfPath;
      
      // Check if path needs fixing
      if (oldPath) {
        let newPath = oldPath;
        
        // Fix file system paths
        if (oldPath.includes('./storage/') || oldPath.includes('\\storage\\')) {
          const filename = oldPath.split(/[/\\]/).pop();
          newPath = `/storage/pdfs/${filename}`;
        }
        // Fix paths without leading slash
        else if (oldPath.startsWith('storage/') || oldPath.startsWith('storage\\')) {
          const filename = oldPath.split(/[/\\]/).pop();
          newPath = `/storage/pdfs/${filename}`;
        }
        // Fix paths with wrong slashes
        else if (oldPath.includes('\\')) {
          newPath = oldPath.replace(/\\/g, '/');
          if (!newPath.startsWith('/')) {
            newPath = '/' + newPath;
          }
        }
        
        if (newPath !== oldPath) {
          console.log(`Updating ${pickup.referenceNumber}:`);
          console.log(`  Old: ${oldPath}`);
          console.log(`  New: ${newPath}`);
          
          await prisma.pickup.update({
            where: { id: pickup.id },
            data: { pdfPath: newPath },
          });
        } else {
          console.log(`${pickup.referenceNumber}: Path OK: ${oldPath}`);
        }
      }
    }

    console.log('\n✅ PDF paths fixed!');
  } catch (error) {
    console.error('Error fixing PDF paths:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPdfPaths();
